import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core';
import { StockValidator } from './stock.validator';
import { PrismaTransaction } from 'src/common/types';
import { PlanChangeService } from './plan-change.service';
import { StockCreateStockPriceRequest } from 'src/@shared/api';
import { ulid } from 'ulid';
import { Util } from 'src/common';
import { LocationRetriveService } from 'src/modules/inhouse/service/location-retrive.service';

@Injectable()
export class StockChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockValidator: StockValidator,
    private readonly planChangeService: PlanChangeService,
    private readonly locationRetriveService: LocationRetriveService,
  ) {}

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
        select: {
          id: true,
          company: {
            select: {
              invoiceCode: true,
            },
          },
        },
      });

      const stock = await tx.stock.create({
        data: {
          serial: Util.serialP(plan.company.invoiceCode),
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
          stock: {
            connect: {
              id: stock.id,
            },
          },
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

      await this.cacheStockQuantityTx(tx, {
        id: stock.id,
      });

      return {
        planId: plan.id,
        stockId: stock.id,
        stockEventId: stockEvent.id,
      };
    });
  }

  /** 신규 재고 등록 */
  async createArrivalStock(params: {
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
    quantity: number;
    stockPrice: StockCreateStockPriceRequest;
    dstLocationId: number;
    wantedDate: string;
  }) {
    const location = await this.locationRetriveService.getItem(
      params.dstLocationId,
    );
    if (!location || location.company.id !== params.companyId)
      throw new NotFoundException(`존재하지 않는 도착지 입니다.`);
    if (location.isPublic)
      throw new BadRequestException(`자사도착지를 선택하셔야 합니다.`);

    return await this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({
        data: {
          planNo: ulid(),
          type: 'INHOUSE_CREATE',
          companyId: params.companyId,
          planShipping: {
            create: {
              dstLocation: {
                connect: {
                  id: params.dstLocationId,
                },
              },
              wantedDate: params.wantedDate,
            },
          },
        },
        select: {
          id: true,
          company: {
            select: {
              invoiceCode: true,
            },
          },
        },
      });

      const stock = await tx.stock.create({
        data: {
          serial: Util.serialP(plan.company.invoiceCode),
          companyId: params.companyId,
          initialPlanId: plan.id,
          planId: plan.id,
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
              ...params.stockPrice,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const stockEvent = await tx.stockEvent.create({
        data: {
          stock: {
            connect: {
              id: stock.id,
            },
          },
          status: 'PENDING',
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

      await this.cacheStockQuantityTx(tx, {
        id: stock.id,
      });

      return {
        planId: plan.id,
        stockId: stock.id,
        stockEventId: stockEvent.id,
      };
    });
  }

  async changeStockQuantity(
    companyId: number,
    stockId: number,
    quantity: number,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: {
          id: stockId,
        },
      });
      if (!stock || stock.companyId !== companyId)
        throw new NotFoundException(`존재하지 않는 재고입니다.`);
      if (stock.planId !== null)
        throw new ConflictException(
          `도착예정재고는 재고증감을 할 수 없습니다.`,
        );

      if (quantity < 0) {
        if (stock.cachedQuantityAvailable < Math.abs(quantity))
          throw new ConflictException(`가용수량 이하로 감소시킬 수 없습니다.`);
      }

      await tx.stockEvent.create({
        data: {
          stock: {
            connect: {
              id: stock.id,
            },
          },
          change: quantity,
          status: 'NORMAL',
          plan: {
            create: {
              planNo: ulid(),
              type: 'INHOUSE_STOCK_QUANTITY_CHANGE',
              company: {
                connect: {
                  id: companyId,
                },
              },
              status: 'PROGRESSED',
            },
          },
        },
      });

      await this.cacheStockQuantityTx(tx, {
        id: stock.id,
      });
    });
  }
}
