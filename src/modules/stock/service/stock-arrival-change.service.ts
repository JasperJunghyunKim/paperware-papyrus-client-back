import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { StockChangeService } from './stock-change.service';

@Injectable()
export class StockArrivalChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockChangeService,
  ) {}

  async applyStockArrival(id: number) {
    await this.prisma.$transaction(async (tx) => {
      const se = await tx.stockEvent.update({
        where: {
          id,
        },
        data: {
          status: 'NORMAL',
        },
        select: {
          stockId: true,
        },
      });

      await this.stock.cacheStockQuantityTx(tx, {
        id: se.stockId,
      });
    });
  }
}
