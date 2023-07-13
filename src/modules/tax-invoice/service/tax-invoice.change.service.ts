import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, TaxInvoicePurposeType } from '@prisma/client';
import { Util } from 'src/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class TaxInvoiceChangeService {
  constructor(private priamsService: PrismaService) {}

  async createTaxInvoice(params: {
    userId: number;
    companyId: number;
    srcCompanyId: number;
    writeDate: string;
    purposeType: TaxInvoicePurposeType;
  }) {
    return await this.priamsService.$transaction(async (tx) => {
      const srcCompany = await tx.company.findUnique({
        include: {
          dstBusinessRelationship: {
            where: {
              srcCompanyId: params.companyId,
            },
          },
          srcBusinessRelationship: {
            where: {
              dstCompanyId: params.companyId,
            },
          },
        },
        where: {
          id: params.srcCompanyId,
        },
      });
      if (
        !srcCompany ||
        srcCompany.dstBusinessRelationship.length === 0 ||
        srcCompany.srcBusinessRelationship.length === 0
      ) {
        throw new NotFoundException(`존재하지 않는 거래처 입니다.`);
      }

      const dstCompany = await tx.company.findUnique({
        where: {
          id: params.companyId,
        },
      });

      const user = await tx.user.findUnique({
        where: {
          id: params.userId,
        },
      });

      const taxInvoice = await this.priamsService.taxInvoice.create({
        data: {
          // 공급자
          companyId: params.companyId,
          dstCompanyRegistrationNumber: dstCompany.companyRegistrationNumber,
          dstCompanyName: dstCompany.businessName,
          dstCompanyRepresentative: dstCompany.representative,
          dstCompanyAddress: dstCompany.address,
          dstCompanyBizItem: dstCompany.bizItem,
          dstCompanyBizType: dstCompany.bizType,
          dstEmail: user.email,
          srcCompanyRegistrationNumber: srcCompany.companyRegistrationNumber,
          srcCompanyName: srcCompany.businessName,
          srcCompanyRepresentative: srcCompany.representative,
          srcCompanyAddress: srcCompany.address,
          srcCompanyBizItem: srcCompany.bizItem,
          srcCompanyBizType: srcCompany.bizType,
          writeDate: params.writeDate,
          purposeType: params.purposeType,
          invoicerMgtKey: ulid().substring(0, 24),
        },
        select: { id: true },
      });
      return taxInvoice.id;
    });
  }

  async updateTaxInvoice(params: {
    companyId: number;
    id: number;
    writeDate: string;
    purposeType: TaxInvoicePurposeType;
    dstEmail: string;
    srcEmail: string;
    srcEmail2: string;
    memo: string;
    cash: number | null;
    check: number | null;
    note: number | null;
    credit: number | null;
  }) {
    return await this.priamsService.$transaction(async (tx) => {
      const taxInvoice = await tx.taxInvoice.findFirst({
        include: {
          order: true,
        },
        where: {
          id: params.id,
          companyId: params.companyId,
          isDeleted: false,
        },
      });
      if (!taxInvoice || taxInvoice.companyId !== params.companyId) {
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      }
      if (taxInvoice.status !== 'PREPARING') {
        throw new ConflictException(`수정할 수 없는 상태의 세금계산서 입니다.`);
      }

      if (
        !Util.isSameDay(taxInvoice.writeDate.toISOString(), params.writeDate) &&
        taxInvoice.order.length > 0
      ) {
        throw new ConflictException(
          `매출이 등록되어 있어, 작성일을 변경할 수 없습니다.`,
        );
      }

      await tx.taxInvoice.update({
        where: { id: params.id },
        data: {
          writeDate: params.writeDate,
          purposeType: params.purposeType,
          dstEmail: params.dstEmail,
          srcEmail: params.srcEmail,
          srcEmail2: params.srcEmail2,
          memo: params.memo,
          cash: params.cash,
          check: params.check,
          note: params.note,
          credit: params.credit,
        },
        select: { id: true },
      });

      return params.id;
    });
  }

  async deleteTaxInvoice(params: { companyId: number; id: number }) {
    await this.priamsService.$transaction(async (tx) => {
      const taxInvoice = await tx.taxInvoice.findFirst({
        include: {
          order: true,
        },
        where: {
          id: params.id,
          isDeleted: false,
          companyId: params.companyId,
        },
      });
      if (!taxInvoice || taxInvoice.companyId !== params.companyId) {
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      }
      if (taxInvoice.status !== 'PREPARING') {
        throw new ConflictException(`삭제할 수 없는 상태의 세금계산서 입니다.`);
      }
      if (taxInvoice.order.length > 0) {
        throw new ConflictException(
          `매출이 등록된 세금계산서는 삭제할 수 없습니다.`,
        );
      }

      await tx.taxInvoice.update({
        where: {
          id: params.id,
        },
        data: {
          isDeleted: true,
        },
      });
    });

    return params.id;
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
        orderDate: string;
      }[] = await tx.$queryRaw`
        SELECT o.id, o.srcCompanyId, o.dstCompanyId, o.status, o.taxInvoiceId, sc.companyRegistrationNumber, o.orderDate
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

      const taxInvoice = await tx.taxInvoice.findFirst({
        where: {
          id: taxInvoiceId,
          companyId,
          isDeleted: false,
        },
      });
      if (!taxInvoice || taxInvoice.companyId !== companyId) {
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      }

      for (const order of orders) {
        if (
          !Util.isSameMonth(taxInvoice.writeDate.toISOString(), order.orderDate)
        ) {
          throw new BadRequestException(
            `세금계산서 작성일과 다른 달의 매출이 포함되어 있습니다.`,
          );
        }

        if (order.status !== 'ACCEPTED')
          throw new BadRequestException(
            `승인되지 않은 매출이 포함되어 있습니다.`,
          );
        if (
          order.companyRegistrationNumber !==
          taxInvoice.srcCompanyRegistrationNumber
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
