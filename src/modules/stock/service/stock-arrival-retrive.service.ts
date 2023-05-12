import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class StockArrivalRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getStockArrivalList(params: {
    skip?: number;
    take?: number;
    companyId: number;
  }): Promise<Model.StockEvent[]> {
    const { skip, take } = params;

    const items = await this.prisma.stockEvent.findMany({
      skip,
      take,
      orderBy: {
        id: 'desc',
      },
      select: Selector.STOCK_EVENT,
      where: {
        status: 'PENDING',
        stock: {
          companyId: params.companyId,
        },
        change: {
          gt: 0,
        },
      },
    });

    return items.map((item) => ({
      ...item,
      stock: {
        ...item.stock,
        initialOrder: {
          ...item.stock.initialOrder,
          wantedDate: Util.dateToIso8601(item.stock.initialOrder?.wantedDate),
        },
      },
    }));
  }

  async getStockArrivalCount(params: { companyId: number }) {
    return await this.prisma.stockEvent.count({
      where: {
        status: 'PENDING',
        stock: {
          companyId: params.companyId,
        },
        change: {
          gt: 0,
        },
      },
    });
  }
}
