import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core';
import { StockValidator } from './stock.validator';
import { PrismaTransaction } from 'src/common/types';
import { PlanChangeService } from './plan-change.service';
import { StockPrice } from 'src/@shared/models';

@Injectable()
export class StockChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockValidator: StockValidator,
    private readonly planChangeService: PlanChangeService,
  ) { }

  async cacheStockQuantityTx(
    tx: PrismaTransaction,
    where: Prisma.StockWhereUniqueInput,
  ) {
    const quantity = await tx.stockEvent.aggregate({
      _sum: {
        change: true,
      },
      where: {
        stockId: where.id,
        status: 'NORMAL',
      },
    });
    const quantityAvailable = await tx.stockEvent.aggregate({
      _sum: {
        change: true,
      },
      where: {
        stockId: where.id,
        OR: [
          {
            status: 'NORMAL',
          },
          {
            status: 'PENDING',
          },
        ],
      },
    });
    return await tx.stock.update({
      data: {
        cachedQuantity: quantity._sum.change || 0,
        cachedQuantityAvailable: quantityAvailable._sum.change || 0,
      },
      where,
    });
  }

  async create(
    params: {
      companyId: number;
      productId: number;
      packagingId: number;
      grammage: number;
      sizeX: number;
      sizeY: number;
      paperColorGroupId: number | null;
      paperColorId: number | null;
      paperPatternId: number | null;
      paperCertId: number | null;
      warehouseId: number | null;
      quantity: number;
      price: StockPrice;
    },
  ) {
    // await this.prisma.$transaction(async (tx) => {
    //   const createStockResult = await this.planChangeService.insertInstantiate(
    //     tx,
    //     params,
    //   );

    //   await this.cacheStockQuantityTx(tx, {
    //     id: createStockResult.stockId,
    //   });

    //   return {
    //     planId: plan.id,
    //     stockId: stock.id,
    //     stockEventId: stockEvent.id,
    //   };
    // });
  }
}
