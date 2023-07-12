import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { Util } from 'src/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class TaxInvoiceChangeService {
  constructor(private priamsService: PrismaService) {}

  async createTaxInvoice(params: {
    companyId: number;
    companyRegistrationNumber: string;
    writeDate: string;
  }) {
    const data = await this.priamsService.taxInvoice.create({
      data: {
        companyId: params.companyId,
        companyRegistrationNumber: params.companyRegistrationNumber,
        writeDate: params.writeDate,
        invoicerMgtKey: ulid().substring(0, 24),
      },
      select: { id: true },
    });

    return data.id;
  }

  async updateTaxInvoice(params: {
    companyId: number;
    id: number;
    writeDate: string;
    dstEmail: string;
    srcEmail: string;
    srcEmail2: string;
    memo: string;
  }) {
    return await this.priamsService.$transaction(async (tx) => {
      const taxInvoice = await tx.taxInvoice.findUnique({
        where: {
          id: params.id,
        },
      });
      if (!taxInvoice || taxInvoice.companyId !== params.companyId) {
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      }
      if (taxInvoice.status !== 'PREPARING') {
        throw new ConflictException(`수정할 수 없는 상태의 세금계산서 입니다.`);
      }

      await tx.taxInvoice.update({
        where: { id: params.id },
        data: {
          writeDate: params.writeDate,
          dstEmail: params.dstEmail,
          srcEmail: params.srcEmail,
          srcEmail2: params.srcEmail2,
          memo: params.memo,
        },
        select: { id: true },
      });

      return params.id;
    });
  }

  async deleteTaxInvoice(params: { id: number }) {
    const data = await this.priamsService.taxInvoice.delete({
      where: { id: params.id },
      select: { id: true },
    });

    return data.id;
  }

  async addOrder(companyId: number, taxInvoiceId: number, orderIds: number[]) {
    await this.priamsService.$transaction(async (tx) => {
      const orders: {
        id: number;
        srcCompanyId: number;
        dstCompanyId: number;
        status: OrderStatus;
        taxInvoiceId: number | null;
        companyRegistrationNumber: string;
      }[] = await tx.$queryRaw`
        SELECT o.id, o.srcCompanyId, o.dstCompanyId, o.status, o.taxInvoiceId, sc.companyRegistrationNumber
          FROM \`Order\`  AS o
          JOIN Company AS sc  ON sc.id = o.srcCompanyId
         WHERE o.dstCompanyId = ${companyId}
           AND o.id IN (${Prisma.join(orderIds)})
         FOR UPDATE;
      `;

      if (orderIds.length !== orders.length)
        throw new BadRequestException(
          `존재하지 않는 매출이 포함되어 있습니다.`,
        );

      const taxInvoice = await tx.taxInvoice.findUnique({
        where: {
          id: taxInvoiceId,
        },
      });
      if (!taxInvoice || taxInvoice.companyId !== companyId) {
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      }

      for (const order of orders) {
        if (order.status !== 'ACCEPTED')
          throw new BadRequestException(
            `승인되지 않은 매출이 포함되어 있습니다.`,
          );
        if (
          order.companyRegistrationNumber !==
          taxInvoice.companyRegistrationNumber
        ) {
          throw new BadRequestException(
            `공급받는자가 세금계산서와 다른 매출이 포함되어 있습니다.`,
          );
        }
        if (
          order.taxInvoiceId !== null &&
          order.taxInvoiceId !== taxInvoice.id
        ) {
          throw new BadRequestException(
            `다른 세금계산서에 등록된 매출이 포함되어 있습니다.`,
          );
        }
      }

      // 추가
      await tx.order.updateMany({
        where: {
          id: {
            in: orderIds,
          },
        },
        data: {
          taxInvoiceId,
        },
      });
    });
  }

  async deleteOrder(
    companyId: number,
    taxInvoiceId: number,
    orderIds: number[],
  ) {
    await this.priamsService.$transaction(async (tx) => {
      const taxInvoice = await tx.taxInvoice.findUnique({
        where: {
          id: taxInvoiceId,
        },
      });
      if (!taxInvoice || taxInvoice.companyId !== companyId) {
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      }

      const orders: {
        id: number;
        srcCompanyId: number;
        dstCompanyId: number;
        status: OrderStatus;
        taxInvoiceId: number | null;
        companyRegistrationNumber: string;
      }[] = await tx.$queryRaw`
        SELECT o.id, o.srcCompanyId, o.dstCompanyId, o.status, o.taxInvoiceId, sc.companyRegistrationNumber
          FROM \`Order\`  AS o
          JOIN Company AS sc  ON sc.id = o.srcCompanyId
         WHERE o.dstCompanyId = ${companyId}
           AND o.id IN (${Prisma.join(orderIds)})
           AND o.taxInvoiceId = ${taxInvoiceId}
         FOR UPDATE;
      `;

      if (orderIds.length !== orders.length)
        throw new BadRequestException(
          `해당 세금계산서에 등록되어 있지 않은 매출이 포함되어 있습니다.`,
        );

      await tx.order.updateMany({
        where: {
          id: {
            in: orderIds,
          },
        },
        data: {
          taxInvoiceId: null,
        },
      });
    });
  }
}
