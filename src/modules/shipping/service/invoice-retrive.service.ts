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
    companyId: number;
  }): Promise<Model.Invoice[]> {
    const { companyId } = params;

    const invoices = await this.prisma.invoice.findMany({
      where: {
        plan: {
          companyId: companyId,
        },
      },
      skip: params.skip,
      take: params.take,
      select: Selector.INVOICE,
    });

    return invoices.map((invoice) => ({
      ...invoice,
      plan: {
        ...invoice.plan,
        orderStock: {
          order: {
            ...invoice.plan.orderStock.order,
            wantedDate: Util.dateToIso8601(
              invoice.plan.orderStock.order.wantedDate,
            ),
          },
        },
        createdAt: Util.dateToIso8601(invoice.plan.createdAt),
      },
    }));
  }

  async getCount(params: { companyId: number }): Promise<number> {
    const { companyId } = params;

    const count = await this.prisma.invoice.count({
      where: {
        plan: {
          companyId: companyId,
        },
      },
    });

    return count;
  }
}
