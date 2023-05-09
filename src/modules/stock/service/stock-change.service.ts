import { Injectable } from '@nestjs/common';
import { PackagingType, Prisma, StockEventStatus } from '@prisma/client';
import { PrismaService } from 'src/core';
import { StockValidator } from './stock.validator';
import { ulid } from 'ulid';

@Injectable()
export class StockChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockValidator: StockValidator,
  ) {}

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

      const stockEvent = await tx.stockEvent.create({
        data: {
          stock: {
            connect: {
              id: stock.id,
            },
          },
          change:
            packaging.type === PackagingType.ROLL
              ? quantity * 1000000
              : quantity, // TODO... 계산 함수 만들기
          status: StockEventStatus.NORMAL,
        },
        select: {
          id: true,
        },
      });

      // 재고 생성 시 PLAN은 필요하지 않기때문에 아래 주석처리합니다.
      // await tx.plan.create({
      //   data: {
      //     planNo: ulid(),
      //     companyId: stockData.company.connect.id,
      //     stockEventOut: {
      //       connect: {
      //         id: stockEvent.id,
      //       },
      //     },
      //   },
      // });

      await this.cacheStockQuantityTx(tx, {
        id: stock.id,
      });
    });

    return stock;
  }
}
