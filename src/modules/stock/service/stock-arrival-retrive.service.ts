import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class StockArrivalRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getStockArrivalList(params: {
    skip?: number;
    take?: number;
    companyId: number;
  }): Promise<Model.StockGroupEvent[]> {
    const { skip, take, companyId } = params;

    const items = await this.prisma.stockGroupEvent.findMany({
      skip,
      take,
      select: Selector.STOCK_GROUP_EVENT,
      orderBy: {
        id: 'desc'
      },
      where: {
        status: 'PENDING',
        stockGroup: {
          companyId,
        },
        change: {
          gt: 0,
        }
      }
    });

    return items.map(item => ({
      ...item
    }));
  }

  async getStockArrivalCount(params: { companyId: number }) {
    return await this.prisma.stockGroupEvent.count({
      where: {
        status: 'PENDING',
        stockGroup: {
          companyId: params.companyId,
        },
        change: {
          gt: 0,
        },
      },
    });
  }
}
