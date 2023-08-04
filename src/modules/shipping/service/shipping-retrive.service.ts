import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, Prisma, ShippingType } from '@prisma/client';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';
import { InvoiceService } from './invoice.service';

@Injectable()
export class ShippingRetriveService {
  constructor(
    private prisma: PrismaService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async getList(params: {
    skip?: number;
    take?: number;
    companyId?: number;
    invoiceStatus: InvoiceStatus[];
    types: ShippingType[];
    shippingNo: string | null;
    managerIds: number[];
    partnerCompanyRegistrationNumbers: string[];
    memo: string | null;
    minCreatedAt: string | null;
    maxCreatedAt: string | null;
  }): Promise<{
    items: Model.ShippingItem[];
    total: number;
  }> {
    const { companyId } = params;

    // 검색
    // 1. 배송상태
    params.invoiceStatus = Array.from(new Set(params.invoiceStatus)).filter(
      (s) => Util.inc(s, 'WAIT_SHIPPING', 'ON_SHIPPING', 'DONE_SHIPPING'),
    );
    const invoiceStatusQuery =
      params.invoiceStatus.length > 0
        ? Prisma.sql`JOIN (
        SELECT *
          FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY shippingId) AS rowNum
              FROM Invoice
             WHERE invoiceStatus IN (${Prisma.join(params.invoiceStatus)})
          ) AS A
        WHERE rowNum = 1
      ) AS invoiceStatusCheck ON invoiceStatusCheck.shippingId = s.id
    `
        : Prisma.empty;

    // 2. 배송 구분
    params.types = Array.from(new Set(params.types)).filter((t) =>
      Util.inc(t, 'INHOUSE', 'OUTSOURCE', 'PARTNER_PICKUP'),
    );
    const typeQuery =
      params.types.length > 0
        ? Prisma.sql`AND s.type IN (${Prisma.join(params.types)})`
        : Prisma.empty;

    // 3. 배송 번호
    const shippingNoQuery = params.shippingNo
      ? Prisma.sql`AND s.shippingNo = ${params.shippingNo}`
      : Prisma.empty;

    // 4. 담당자
    const managerQuery =
      params.managerIds.length > 0
        ? Prisma.sql`AND m.id IN (${Prisma.join(params.managerIds)})`
        : Prisma.empty;

    // 5. 거래처
    const partnerQuery =
      params.partnerCompanyRegistrationNumbers.length > 0
        ? Prisma.sql`AND s.companyRegistrationNumber IN (${Prisma.join(
            params.partnerCompanyRegistrationNumbers,
          )})`
        : Prisma.empty;

    // 6. 배송메모
    const memoQuery = params.memo
      ? Prisma.sql`AND s.memo LIKE ${'%' + params.memo + '%'}`
      : Prisma.empty;

    // 7. 생성일
    const minCreatedAtQuery = params.minCreatedAt
      ? Prisma.sql`AND DATE(CONVERT_TZ(s.createdAt, '+00:00', '+09:00')) >= DATE(CONVERT_TZ(${params.minCreatedAt}, '+00:00', '+09:00'))`
      : Prisma.empty;
    const maxCreatedAtQuery = params.maxCreatedAt
      ? Prisma.sql`AND DATE(CONVERT_TZ(s.createdAt, '+00:00', '+09:00')) <= DATE(CONVERT_TZ(${params.maxCreatedAt}, '+00:00', '+09:00'))`
      : Prisma.empty;

    const searchShippings: {
      id: number;
      total: bigint;
    }[] = await this.prisma.$queryRaw`
      SELECT s.id AS id

            , COUNT(1) OVER() AS total

        FROM Shipping     AS s
   LEFT JOIN User         AS m      ON m.id = s.managerId
        ${invoiceStatusQuery}
      
       WHERE s.companyId = ${params.companyId}
         AND s.isDeleted = ${false}
         ${typeQuery}
         ${shippingNoQuery}
         ${managerQuery}
         ${partnerQuery}
         ${memoQuery}
         ${minCreatedAtQuery}
         ${maxCreatedAtQuery}

       ORDER BY s.id DESC

       LIMIT ${params.skip}, ${params.take}
    `;

    if (searchShippings.length === 0) {
      return {
        items: [],
        total: 0,
      };
    }

    const shippings = await this.prisma.shipping.findMany({
      where: {
        id: {
          in: searchShippings.map((s) => s.id),
        },
      },
      select: {
        ...Selector.SHIPPING,
        invoice: {
          include: {
            packaging: true,
          },
        },
        _count: {
          select: {
            invoice: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      items: shippings.map((shipping) =>
        Util.serialize({
          ...shipping,
          invoice: shipping.invoice.map((invoice) => ({
            invoiceStatus: invoice.invoiceStatus,
          })),
          invoiceCount: shipping._count.invoice,
          invoiceWeight: this.invoiceService.getInvoicesWeight(
            shipping.invoice,
          ),
        }),
      ),
      total: Number(searchShippings[0].total),
    };
  }

  async getCount(params: {
    companyId?: number;
    invoiceStatus: InvoiceStatus[];
  }): Promise<number> {
    const { companyId } = params;

    const invoiceStatusMap = new Map<InvoiceStatus, boolean>();
    params.invoiceStatus = params.invoiceStatus.filter((s) =>
      Util.inc(s, 'WAIT_SHIPPING', 'ON_SHIPPING', 'DONE_SHIPPING'),
    );
    for (const status of params.invoiceStatus) {
      invoiceStatusMap.set(status, true);
    }

    const count = await this.prisma.shipping.count({
      where: {
        companyId: companyId,
        isDeleted: false,
        invoice:
          params.invoiceStatus.length > 0
            ? {
                some: {
                  invoiceStatus: {
                    in: params.invoiceStatus,
                  },
                },
              }
            : undefined,
      },
    });

    return count;
  }

  async get(
    companyId: number,
    shippingId: number,
  ): Promise<Model.ShippingItem> {
    const shipping = await this.prisma.shipping.findFirst({
      where: {
        id: shippingId,
        companyId: companyId,
        isDeleted: false,
      },
      select: {
        ...Selector.SHIPPING,
        invoice: {
          include: {
            packaging: true,
          },
        },
        _count: {
          select: {
            invoice: true,
          },
        },
      },
    });
    if (!shipping)
      throw new NotFoundException(`존재하지 않는 배송정보 입니다.`);

    return Util.serialize({
      ...shipping,
      invoice: shipping.invoice.map((invoice) => ({
        invoiceStatus: invoice.invoiceStatus,
      })),
      invoiceCount: shipping._count.invoice,
      invoiceWeight: this.invoiceService.getInvoicesWeight(shipping.invoice),
    });
  }
}
