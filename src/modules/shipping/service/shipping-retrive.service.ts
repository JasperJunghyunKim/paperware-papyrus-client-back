import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
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

    return shippings.map((shipping) =>
      Util.serialize({
        ...shipping,
        invoice: shipping.invoice.map((invoice) => ({
          invoiceStatus: invoice.invoiceStatus,
        })),
        invoiceCount: shipping._count.invoice,
        invoiceWeight: this.invoiceService.getInvoicesWeight(shipping.invoice),
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
