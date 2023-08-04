import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShippingStatus, ShippingType } from '@prisma/client';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { Util } from 'src/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ShippingChangeService {
  constructor(private prisma: PrismaService) {}

  async create(params: {
    userId: number;
    companyId: number;
    type: ShippingType;
    managerId: number | null;
    companyRegistrationNumber: string | null;
    price: number | null;
    memo: string | null;
  }) {
    const {
      companyId,
      type,
      managerId,
      companyRegistrationNumber,
      price,
      memo,
    } = params;

    return await this.prisma.$transaction(async (tx) => {
      if (managerId) {
        const manager = await tx.user.findFirst({
          where: {
            companyId,
            id: managerId,
          },
        });
        if (!manager) throw new NotFoundException(`존재하지 않는 직원 입니다.`);
      }
      if (companyRegistrationNumber) {
        const partner = await tx.partner.findUnique({
          where: {
            companyId_companyRegistrationNumber: {
              companyId,
              companyRegistrationNumber,
            },
          },
        });
        if (!partner)
          throw new NotFoundException(`거래처로 등록되지 않은 거래처입니다.`);
      }

      const company = await tx.company.findUnique({
        where: {
          id: companyId,
        },
      });

      const today = dayjs().tz('Asia/Seoul');
      const month = today.format('YYMM');

      const [count]: {
        total: bigint;
      }[] = await tx.$queryRaw`
        SELECT COUNT(1) AS total
          FROM Shipping
         WHERE shippingNo LIKE ${`S${company.invoiceCode}${month}` + '%'}

         FOR UPDATE;
      `;

      const num = count ? Number(count.total) + 1 : 1;

      const shipping = await tx.shipping.create({
        data: {
          type,
          shippingNo: Util.serialS(company.invoiceCode, month, num),
          price: price || 0,
          companyId,
          managerId,
          companyRegistrationNumber,
          memo: memo || '',
          createdById: params.userId,
        },
      });

      return {
        id: shipping.id,
      };
    });
  }

  async connectInvoices(params: { shippingId: number; invoiceIds: number[] }) {
    const { shippingId, invoiceIds } = params;

    const shippings = await this.prisma.$transaction(async (tx) => {
      await tx.invoice.updateMany({
        where: {
          id: {
            in: invoiceIds,
          },
        },
        data: {
          shippingId: shippingId,
          invoiceStatus: 'WAIT_SHIPPING',
        },
      });

      return await tx.shipping.update({
        where: {
          id: shippingId,
        },
        data: {
          invoice: {
            connect: invoiceIds.map((invoiceId) => ({
              id: invoiceId,
            })),
          },
        },
      });
    });

    return shippings;
  }

  async forward(params: { shippingId: number }) {
    const { shippingId } = params;

    const shipping = await this.prisma.shipping.findUnique({
      where: {
        id: shippingId,
      },
      select: {
        status: true,
      },
    });

    await this.prisma.shipping.update({
      where: {
        id: shippingId,
      },
      data: {
        status: shipping.status == 'PREPARING' ? 'PROGRESSING' : 'DONE',
      },
    });

    return shipping;
  }

  async backward(params: { shippingId: number }) {
    const { shippingId } = params;

    const shipping = await this.prisma.shipping.findUnique({
      where: {
        id: shippingId,
      },
      select: {
        status: true,
      },
    });

    await this.prisma.shipping.update({
      where: {
        id: shippingId,
      },
      data: {
        status: shipping.status == 'DONE' ? 'PROGRESSING' : 'PREPARING',
      },
    });

    return shipping;
  }

  async delete(companyId: number, shippingId: number) {
    await this.prisma.$transaction(async (tx) => {
      const shipping = await tx.shipping.findUnique({
        where: {
          id: shippingId,
        },
        include: {
          invoice: {
            where: {
              invoiceStatus: {
                not: 'WAIT_LOADING',
              },
            },
          },
        },
      });
      if (!shipping || shipping.isDeleted || shipping.companyId !== companyId)
        throw new NotFoundException(`존재하지 않는 배송입니다.`);
      if (shipping.invoice.length > 0)
        throw new ConflictException(`송장이 포함되어 있어 삭제할 수 없습니다.`);

      await tx.shipping.update({
        where: {
          id: shippingId,
        },
        data: {
          isDeleted: true,
        },
      });
    });
  }

  async update(params: {
    companyId: number;
    shippingId: number;
    companyRegistrationNumber: string | null;
    price: number | null;
    memo: string | null;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const shipping = await tx.shipping.findFirst({
        where: {
          companyId: params.companyId,
          id: params.shippingId,
          isDeleted: false,
        },
      });
      if (!shipping)
        throw new NotFoundException(`존재하지 않는 배송정보 입니다.`);

      switch (shipping.type) {
        case 'INHOUSE':
          if (params.companyRegistrationNumber)
            throw new BadRequestException(
              `자사배송은 거래처를 선택할 수 없습니다.`,
            );
          break;
        case 'OUTSOURCE':
          if (!params.memo)
            throw new BadRequestException(
              `외주배송은 배송메모를 필수로 입력하셔야 합니다.`,
            );
          break;
        case 'PARTNER_PICKUP':
          if (!params.memo)
            throw new BadRequestException(
              `거래처 픽업은 배송메모를 필수로 입력하셔야 합니다.`,
            );
          break;
      }

      await tx.shipping.update({
        where: {
          id: params.shippingId,
        },
        data: {
          companyRegistrationNumber: params.companyRegistrationNumber,
          price: params.price || 0,
          memo: params.memo || '',
        },
      });

      return {
        id: shipping.id,
      };
    });
  }

  async unassignManager(companyId: number, shippingId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const [shipping]: {
        id: number;
        type: ShippingType;
        status: ShippingStatus;
        managerId: number | null;
      }[] = await tx.$queryRaw`
        SELECT *
          FROM Shipping
         WHERE id = ${shippingId}
           AND companyId = ${companyId}
           AND isDeleted = ${false}

        FOR UPDATE;
      `;
      if (!shipping)
        throw new NotFoundException(`존재하지 않는 배송정보 입니다.`);
      if (!shipping.managerId)
        throw new ConflictException(`담당자가 지정되어 있지 않습니다.`);

      await tx.shipping.update({
        where: {
          id: shippingId,
        },
        data: {
          manager: {
            disconnect: true,
          },
        },
      });
    });
  }

  async assignManager(
    companyId: number,
    shippingId: number,
    managerId: number,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const [shipping]: {
        id: number;
        type: ShippingType;
        status: ShippingStatus;
        managerId: number | null;
      }[] = await tx.$queryRaw`
        SELECT *
          FROM Shipping
         WHERE id = ${shippingId}
           AND companyId = ${companyId}
           AND isDeleted = ${false}

        FOR UPDATE;
      `;
      if (!shipping)
        throw new NotFoundException(`존재하지 않는 배송정보 입니다.`);
      if (shipping.type !== 'INHOUSE')
        throw new ConflictException(`담당자를 지정할 수 없는 배송타입입니다.`);
      if (shipping.managerId)
        throw new ConflictException(`이미 담당자가 지정되어 있습니다.`);

      const manager = await tx.user.findUnique({
        where: {
          id: managerId,
        },
      });
      if (!manager || manager.companyId !== companyId)
        throw new NotFoundException(`존재하지 않는 직원 입니다.`);

      await tx.shipping.update({
        where: {
          id: shippingId,
        },
        data: {
          manager: {
            connect: {
              id: managerId,
            },
          },
        },
      });
    });
  }
}
