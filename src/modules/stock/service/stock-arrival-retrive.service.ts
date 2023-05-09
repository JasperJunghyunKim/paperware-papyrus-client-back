import { Injectable } from '@nestjs/common';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class StockArrivalRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getStockArrivalList(params: {
    skip?: number;
    take?: number;
    companyId: number;
  }) {
    const { skip, take } = params;

    return await this.prisma.stockEvent.findMany({
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
