import { Injectable } from '@nestjs/common';
import { PlanType, Prisma, StockEventStatus, TaskStatus, TaskType } from '@prisma/client';
import { PrismaService } from 'src/core';
import { StockValidator } from './stock.validator';
import { ulid } from 'ulid';
import { PrismaTransaction } from 'src/common/types';

@Injectable()
export class StockChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockValidator: StockValidator,
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
    stockData: Prisma.StockCreateInput,
    stockPriceData: Prisma.StockPriceCreateInput,
    quantity: number,
  ) {
    const stock = await this.prisma.$transaction(async (tx) => {
      const packaging = await tx.packaging.findUnique({
        where: {
          id: stockData.packaging.connect.id,
        },
      });

      this.stockValidator.validateQuantity(packaging, quantity);

      const stock = await tx.stock.create({
        data: stockData,
        select: {
          id: true,
        },
      });
      await tx.stockPrice.create({
        data: {
          ...stockPriceData,
          stock: {
            connect: {
              id: stock.id,
            },
          },
        },
      });

      // TODO... plan 생성은 추후 혜준님이 만들 plan service 이용
      const plan = await tx.plan.create({
        select: {
          id: true,
          task: true,
        },
        data: {
          planNo: ulid(),
          type: PlanType.INHOUSE_CREATE,
          company: {
            connect: {
              id: stockData.company.connect.id,
            }
          },
          task: {
            create: {
              taskNo: ulid(),
              type: TaskType.INSTANTIATE,
              status: TaskStatus.PROGRESSED,
            }
          },
          targetStockEvent: {
            create: {
              stockId: stock.id,
              change: quantity,
              status: StockEventStatus.NORMAL,
            }
          },
        }
      });

      await this.cacheStockQuantityTx(tx, {
        id: stock.id,
      });
    });

    return stock;
  }
}
