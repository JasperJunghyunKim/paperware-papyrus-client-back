import { Injectable, NotImplementedException } from '@nestjs/common';
import { PackagingType, Prisma, StockEventStatus } from '@prisma/client';
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

      const stockGroup = await tx.stockGroup.findFirst({
        where: {
          productId: stockData.product.connect.id,
          packagingId: stockData.packaging.connect.id,
          grammage: stockData.grammage,
          sizeX: stockData.sizeX,
          sizeY: stockData.sizeY,
          paperColorGroupId: stockData.paperColorGroup?.connect.id || null,
          paperColorId: stockData.paperColor?.connect.id || null,
          paperPatternId: stockData.paperPattern?.connect.id || null,
          paperCertId: stockData.paperCert?.connect.id || null,
          warehouseId: stockData.warehouse.connect.id,
          companyId: stockData.company.connect.id,
          orderStockId: null,
          isArrived: null,
          isDirectShipping: null,
        }
      }) || await tx.stockGroup.create({
        data: {
          productId: stockData.product.connect.id,
          packagingId: stockData.packaging.connect.id,
          grammage: stockData.grammage,
          sizeX: stockData.sizeX,
          sizeY: stockData.sizeY,
          paperColorGroupId: stockData.paperColorGroup?.connect.id || null,
          paperColorId: stockData.paperColor?.connect.id || null,
          paperPatternId: stockData.paperPattern?.connect.id || null,
          paperCertId: stockData.paperCert?.connect.id || null,
          warehouseId: stockData.warehouse.connect.id,
          companyId: stockData.company.connect.id,
        },
      });
      console.log(22222)

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
