import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class InvoiceRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip?: number;
    take?: number;
    shippingId?: number | null;
    planId?: number | null;
    companyId: number;
  }): Promise<Model.Invoice[]> {
    const { companyId } = params;

    const invoices = await this.prisma.invoice.findMany({
      where: {
        plan: {
          id: params.planId ?? undefined,
          companyId: companyId,
        },
        shippingId: params.planId ? undefined : params.shippingId ?? null,
      },
      skip: params.skip,
      take: params.take,
      select: Selector.INVOICE,
    });

    return invoices.map(Util.serialize);
  }

  async getCount(params: {
    companyId: number;
    shippingId?: number | null;
    planId?: number | null;
  }): Promise<number> {
    const { companyId } = params;

    const count = await this.prisma.invoice.count({
      where: {
        plan: {
          id: params.planId ?? undefined,
          companyId: companyId,
        },
        shippingId: params.shippingId,
      },
    });

    return count;
  }

  async getById(id: number): Promise<Model.Invoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id: id,
      },
      select: Selector.INVOICE,
    });

    return Util.serialize(invoice);
  }
}
