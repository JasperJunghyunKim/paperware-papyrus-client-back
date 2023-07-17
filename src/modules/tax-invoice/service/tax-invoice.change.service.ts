import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  OrderType,
  PackagingType,
  Prisma,
  TaxInvoicePurposeType,
  TaxInvoiceStatus,
} from '@prisma/client';
import { Util } from 'src/common';
import { PrismaService } from 'src/core';
import { SUCCESS } from 'src/modules/popbill/code/popbill.code';
import { PopbillRetriveService } from 'src/modules/popbill/service/popbill.retrive.service';
import { createPopbillTaxInvoice } from 'src/modules/popbill/service/popbill.service';
import { ulid } from 'ulid';
import { TaxInvoiceRetriveService } from './tax-invoice.retrive.service';
import { TAX_INVOICE } from 'src/common/selector';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { PopbillChangeService } from 'src/modules/popbill/service/popbill.change.service';

dayjs.extend(utc);
dayjs.extend(timezone);

interface TaxInvoiceForIssue {
  id: number;
  invoicerMgtKey: string;
  writeDate: string;
  purposeType: TaxInvoicePurposeType;
  dstCompanyRegistrationNumber: string;
  dstCompanyName: string;
  dstCompanyRepresentative: string;
  dstCompanyAddress: string;
  dstCompanyBizType: string;
  dstCompanyBizItem: string;
  dstEmail: string;
  srcCompanyRegistrationNumber: string;
  srcCompanyName: string;
  srcCompanyRepresentative: string;
  srcCompanyAddress: string;
  srcCompanyBizType: string;
  srcCompanyBizItem: string;
  srcEmail: string;
  srcEmailName: string;
  srcEmail2: string;
  srcEmailName2: string;
  status: TaxInvoiceStatus;
  cash: number | null;
  check: number | null;
  note: number | null;
  credit: number | null;
  isDeleted: number;
  orderCount: BigInt;
}

@Injectable()
export class TaxInvoiceChangeService {
  private readonly logger = new Logger(TaxInvoiceChangeService.name);

  constructor(
    private prisma: PrismaService,
    private taxInvoiceRetriveService: TaxInvoiceRetriveService,
    private popbillRetriveService: PopbillRetriveService,
    private popbillChangeService: PopbillChangeService,
  ) {}

  async createTaxInvoice(params: {
    userId: number;
    companyId: number;
    srcCompanyId: number;
    writeDate: string;
    purposeType: TaxInvoicePurposeType;
  }) {
    return await this.prisma.$transaction(async (tx) => {
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

      const partner = await tx.partner.findUnique({
        include: {
          partnerTaxManager: {
            where: {
              isDefault: true,
            },
          },
        },
        where: {
          companyId_companyRegistrationNumber: {
            companyId: params.companyId,
            companyRegistrationNumber: srcCompany.companyRegistrationNumber,
          },
        },
      });
      const defaultTaxManager = partner.partnerTaxManager[0] || null;

      const taxInvoice = await this.prisma.taxInvoice.create({
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
          srcEmail: defaultTaxManager ? defaultTaxManager.email : '',
          srcEmailName: defaultTaxManager ? defaultTaxManager.name : '',
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
    srcEmailName: string;
    srcEmail2: string;
    srcEmailName2: string;
    memo: string;
    cash: number | null;
    check: number | null;
    note: number | null;
    credit: number | null;
  }) {
    return await this.prisma.$transaction(async (tx) => {
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
          memo: params.memo,
          cash: params.cash,
          check: params.check,
          note: params.note,
          credit: params.credit,
          srcEmail: params.srcEmail,
          srcEmail2: params.srcEmail2,
          srcEmailName: params.srcEmailName,
          srcEmailName2: params.srcEmailName2,
        },
        select: { id: true },
      });

      return params.id;
    });
  }

  async deleteTaxInvoice(params: { companyId: number; id: number }) {
    await this.prisma.$transaction(async (tx) => {
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
    await this.prisma.$transaction(async (tx) => {
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
    await this.prisma.$transaction(async (tx) => {
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

  async issueTaxInvoice(companyId: number, taxInvoiceId: number) {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
    const check = await this.popbillRetriveService.checkCertValidation(
      company.companyRegistrationNumber,
    );
    if (check !== SUCCESS) {
      const certUrl = await this.popbillRetriveService.getCertUrl(companyId);
      return {
        certUrl,
      };
    }

    return await this.prisma.$transaction(async (tx) => {
      const [taxInvoice]: TaxInvoiceForIssue[] = await tx.$queryRaw`
        SELECT ti.id
              , ti.writeDate AS writeDate
              , ti.invoicerMgtKey AS invoicerMgtKey
              , ti.dstCompanyRegistrationNumber AS dstCompanyRegistrationNumber
              , ti.dstCompanyName AS dstCompanyName
              , ti.dstCompanyRepresentative AS dstCompanyRepresentative
              , ti.dstCompanyAddress AS dstCompanyAddress
              , ti.dstCompanyBizType AS dstCompanyBizType
              , ti.dstCompanyBizItem AS dstCompanyBizItem
              , ti.dstEmail AS dstEmail
              , ti.srcCompanyRegistrationNumber AS srcCompanyRegistrationNumber
              , ti.srcCompanyName AS srcCompanyName
              , ti.srcCompanyRepresentative AS srcCompanyRepresentative
              , ti.srcCompanyAddress AS srcCompanyAddress
              , ti.srcCompanyBizType AS srcCompanyBizType
              , ti.srcCompanyBizItem AS srcCompanyBizItem
              , ti.srcEmail AS srcEmail
              , ti.srcEmailName AS srcEmailName
              , ti.srcEmail2 AS srcEmail2
              , ti.srcEmailName2 AS srcEmailName2
              , ti.status
              , ti.cash AS cash
              , ti.check AS \`check\`
              , ti.note AS note
              , ti.credit AS credit
              , ti.isDeleted AS isDeleted
              , COUNT(CASE WHEN o.id IS NOT NULL THEN 1 END) AS orderCount
          FROM TaxInvoice  AS ti
     LEFT JOIN \`Order\`   AS o   ON o.taxInvoiceId = ti.id
         WHERE ti.id = ${taxInvoiceId}
           AND ti.companyId = ${companyId}

        GROUP BY ti.id

        FOR UPDATE
      `;

      if (!taxInvoice || taxInvoice.isDeleted === 1)
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      if (taxInvoice.status !== 'PREPARING')
        throw new ConflictException(`발행을 할 수 없는 상태입니다.`);
      if (Number(taxInvoice.orderCount) === 0)
        throw new ConflictException(`매출이 등록되지 않은 세금계산서 입니다.`);

      const orders = await tx.$queryRaw`
        SELECT *
          FROM \`Order\`
         WHERE taxInvoiceId = ${taxInvoiceId}
           FOR UPDATE
      `;

      const taxInvoiceEntity = await tx.taxInvoice.findUnique({
        select: TAX_INVOICE,
        where: {
          id: taxInvoiceId,
        },
      });

      const popbillTaxInvoice = createPopbillTaxInvoice({
        ...taxInvoice,
        writeDate: dayjs(taxInvoice.writeDate)
          .tz('Asia/Seoul')
          .format('YYYYMMDD'),
        orders: taxInvoiceEntity.order.map((order) => ({
          item: this.taxInvoiceRetriveService.getOrderItem(order),
          orderDate: dayjs(order.orderDate).tz('Asia/Seoul').format('YYYYMMDD'),
          suppliedPrice:
            order.tradePrice.find((tp) => tp.companyId === companyId)
              ?.suppliedPrice || 0,
          vatPrice:
            order.tradePrice.find((tp) => tp.companyId === companyId)
              ?.vatPrice || 0,
        })),
      });

      this.logger.log(`[세금계산서 발행]`, popbillTaxInvoice);

      const result = await this.popbillChangeService.issueTaxInvoice(
        taxInvoice.dstCompanyRegistrationNumber,
        popbillTaxInvoice,
      );

      if (result instanceof Error) {
        // TODO: 에러처리
      } else if (result.code === SUCCESS) {
        await tx.taxInvoice.update({
          where: {
            id: taxInvoice.id,
          },
          data: {
            status: 'ISSUED',
            ntsconfirmNum: result.ntsConfirmNum,
          },
        });
      }

      return {
        certUrl: null,
      };
    });
  }
}
