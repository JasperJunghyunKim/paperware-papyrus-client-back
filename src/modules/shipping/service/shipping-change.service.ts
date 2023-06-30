import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class ShippingChangeService {
  constructor(private prisma: PrismaService) {}

  async create(params: { companyId: number }) {
    const { companyId } = params;

    const shipping = await this.prisma.shipping.create({
      data: {
        shippingNo: ulid(),
        companyId: companyId,
      },
    });

    return shipping;
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
}
