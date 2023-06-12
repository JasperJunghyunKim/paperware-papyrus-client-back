import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class InvoiceRetriveService {
  constructor(private prisma: PrismaService) { }

  async getList(params: {
    skip?: number;
    take?: number;
    shippingId?: number | null;
    companyId: number;
  }): Promise<Model.Invoice[]> {
    const { companyId } = params;

    const invoices = await this.prisma.invoice.findMany({
      where: {
        plan: {
          companyId: companyId,
        },
        shippingId: params.shippingId ?? null,
      },
      skip: params.skip,
      take: params.take,
      select: Selector.INVOICE,
    });

    // return invoices.map(Util.serialize);
    return []
  }

  async getCount(params: {
    companyId: number;
    shippingId?: number | null;
  }): Promise<number> {
    const { companyId } = params;

    const count = await this.prisma.invoice.count({
      where: {
        plan: {
          companyId: companyId,
        },
        shippingId: params.shippingId,
      },
    });

    return count;
  }
}
