import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core';
import { StockValidator } from './stock.validator';
import { PrismaTransaction } from 'src/common/types';
import { PlanChangeService } from './plan-change.service';
import { StockPrice } from 'src/@shared/models';
import { StockCreateStockPriceRequest } from 'src/@shared/api';
import { ulid } from 'ulid';

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

  /** 신규 재고 등록 */
  async create(params: {
    companyId: number;
    warehouseId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    price: StockCreateStockPriceRequest;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({
        data: {
          planNo: ulid(),
          type: 'INHOUSE_CREATE',
          companyId: params.companyId,
        },
      });

      const stock = await tx.stock.create({
        data: {
          serial: ulid(),
          companyId: params.companyId,
          initialPlanId: plan.id,
          warehouseId: params.warehouseId,
          productId: params.productId,
          packagingId: params.packagingId,
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY || 0,
          paperColorGroupId: params.paperColorGroupId,
          paperColorId: params.paperColorId,
          paperPatternId: params.paperPatternId,
          paperCertId: params.paperCertId,
          cachedQuantity: params.quantity,
          stockPrice: {
            create: {
              ...params.price,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const stockEvent = await tx.stockEvent.create({
        data: {
          stockId: stock.id,
          status: 'NORMAL',
          change: params.quantity,
          plan: {
            connect: {
              id: plan.id,
            },
          },
        },
        select: {
          id: true,
        },
      });

      // TODO... 재고 cache 업데이트

      return {
        planId: plan.id,
        stockId: stock.id,
        stockEventId: stockEvent.id,
      };
    });
  }
}
