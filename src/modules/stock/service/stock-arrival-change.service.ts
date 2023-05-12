import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { StockChangeService } from './stock-change.service';

@Injectable()
export class StockArrivalChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockChangeService,
  ) { }

  async applyStockArrival(id: number, companyId: number, warehouseId: number) {
    await this.prisma.$transaction(async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: {
          id: warehouseId,
          companyId,
          isDeleted: false,
        }
      });
      if (!warehouse) throw new NotFoundException(`존재하지 않는 창고입니다.`);

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

      await tx.stock.update({
        data: {
          warehouseId,
        },
        where: {
          id,
        }
      })

      await this.stock.cacheStockQuantityTx(tx, {
        id: se.stockId,
      });
    });
  }
}
