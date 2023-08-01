import { Injectable } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class ShippingRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip?: number;
    take?: number;
    companyId?: number;
    invoiceStatus: InvoiceStatus[];
  }): Promise<Model.ShippingItem[]> {
    const { companyId } = params;

    const invoiceStatusMap = new Map<InvoiceStatus, boolean>();
    params.invoiceStatus = params.invoiceStatus.filter((s) =>
      Util.inc(s, 'WAIT_SHIPPING', 'ON_SHIPPING', 'DONE_SHIPPING'),
    );
    for (const status of params.invoiceStatus) {
      invoiceStatusMap.set(status, true);
    }

    const shippings = await this.prisma.shipping.findMany({
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
      skip: params.skip,
      take: params.take,
      select: {
        ...Selector.SHIPPING,
        invoice: { select: { invoiceStatus: true } },
        _count: {
          select: {
            invoice: true,
          },
        },
      },
    });

    return shippings.map((shipping) =>
      Util.serialize({
        ...shipping,
        invoiceCount: shipping._count.invoice,
      }),
    );
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
}
