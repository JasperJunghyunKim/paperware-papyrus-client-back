import { Injectable, NotImplementedException } from '@nestjs/common';
import { PackagingType, Prisma, StockEventStatus } from '@prisma/client';
import { PrismaService } from 'src/core';
import { StockValidator } from './stock.validator';
import { ulid } from 'ulid';

@Injectable()
export class StockChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockValidator: StockValidator,
  ) { }

  async cacheStockQuantityTx(
    tx: Omit<
      PrismaService,
      '$on' | '$connect' | '$disconnect' | '$use' | '$transaction'
    >,
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
    // console.log(where.id, quantity._sum.change)
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
        cachedQuantity: quantity._sum.change,
        cachedQuantityAvailable: quantityAvailable._sum.change,
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

      await tx.stockEvent.create({
        data: {
          stock: {
            connect: {
              id: stock.id,
            },
          },
          change: quantity,
          status: StockEventStatus.NORMAL,
        },
        select: {
          id: true,
        },
      });

      await this.cacheStockQuantityTx(tx, {
        id: stock.id,
      });
    });

    return stock;
  }
}
