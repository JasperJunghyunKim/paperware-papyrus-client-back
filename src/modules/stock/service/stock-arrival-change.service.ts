import { ConflictException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { StockChangeService } from './stock-change.service';
import { ulid } from 'ulid';

@Injectable()
export class StockArrivalChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockChangeService,
  ) { }

  async applyStockArrival(planId: number, companyId: number, warehouseId: number) {
    await this.prisma.$transaction(async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: {
          id: warehouseId,
          companyId,
          isDeleted: false,
        },
      });
      if (!warehouse) throw new NotFoundException(`존재하지 않는 창고입니다.`);

      const arrivalStocks = await tx.stock.findMany({
        include: {
          stockEvent: true,
        },
        where: {
          planId,
          companyId,
        }
      });
      if (arrivalStocks.length === 0) throw new NotFoundException(`존재하지 않는 도착예정재고입니다.`);

      const storingStock = arrivalStocks.find(stock => stock.planId === stock.initialPlanId);

      // planId => null
      await tx.stock.updateMany({
        data: {
          planId: null,
        },
        where: {
          id: {
            in: arrivalStocks.map(stock => stock.id),
          }
        }
      });

      // PENDING => NORMAL (입고재고만)
      await tx.stockEvent.updateMany({
        data: {
          status: 'NORMAL'
        },
        where: {
          stockId: storingStock.id,
          status: 'PENDING',
        }
      });

      // 입고재고 cache 업데이트
      await this.stock.cacheStockQuantityTx(tx, {
        id: storingStock.id,
      });
    });
  }
}
