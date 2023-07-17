import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core';
import { StockChangeService } from './stock-change.service';
import { ulid } from 'ulid';
import { DiscountType, OfficialPriceType, PriceUnit } from '@prisma/client';

@Injectable()
export class StockArrivalChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockChangeService,
  ) {}

  async applyStockArrival(params: {
    companyId: number;
    warehouseId: number;
    planId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
  }) {
    await this.prisma.$transaction(async (tx) => {
      const {
        companyId,
        warehouseId,
        planId,
        productId,
        packagingId,
        grammage,
        sizeX,
        sizeY,
        paperColorGroupId,
        paperColorId,
        paperPatternId,
        paperCertId,
      } = params;

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
          initialPlan: {
            select: {
              planShipping: true,
              orderProcess: {
                include: {
                  order: true,
                },
              },
              orderStock: true,
            },
          },
        },
        where: {
          companyId,
          planId,
          productId,
          packagingId,
          grammage,
          sizeX,
          sizeY: sizeY || 0,
          paperColorGroupId,
          paperColorId,
          paperPatternId,
          paperCertId,
        },
      });
      if (arrivalStocks.length === 0)
        throw new NotFoundException(`존재하지 않는 도착예정재고입니다.`);

      const arrivalStock = arrivalStocks[0];
      // if (
      //   arrivalStock.initialPlan.orderProcess &&
      //   arrivalStock.initialPlan.orderProcess.order.dstCompanyId ===
      //     arrivalStock.companyId
      // ) {
      //   throw new BadRequestException(`외주재단매출 재고는 입고 불가능합니다.`);
      // }

      if (
        (arrivalStock.initialPlan.orderStock &&
          arrivalStock.initialPlan.orderStock.isDirectShipping) ||
        (arrivalStock.initialPlan.planShipping &&
          arrivalStock.initialPlan.planShipping.isDirectShipping) ||
        (arrivalStock.initialPlan.orderProcess &&
          arrivalStock.initialPlan.orderProcess.isSrcDirectShipping)
      ) {
        throw new BadRequestException(`직송재고는 입고처리 할 수 없습니다.`);
      }

      const storingStock = arrivalStocks.find(
        (stock) => stock.planId === stock.initialPlanId,
      );

      // planId => null, warehouse => 등록
      await tx.stock.updateMany({
        data: {
          planId: null,
          warehouseId,
        },
        where: {
          id: {
            in: arrivalStocks.map((stock) => stock.id),
          },
        },
      });

      // PENDING => NORMAL (입고재고만)
      await tx.stockEvent.updateMany({
        data: {
          status: 'NORMAL',
        },
        where: {
          stockId: storingStock.id,
          status: 'PENDING',
        },
      });

      // 입고재고 cache 업데이트
      await this.stock.cacheStockQuantityTx(tx, {
        id: storingStock.id,
      });
    });
  }

  async updateStockArrivalPrice(params: {
    companyId: number;
    planId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    stockPrice?: {
      officialPriceType: OfficialPriceType;
      officialPrice: number;
      officialPriceUnit: PriceUnit;
      discountType: DiscountType;
      unitPrice: number;
      discountPrice: number;
      unitPriceUnit: PriceUnit;
    } | null;
  }) {
    const {
      companyId,
      planId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      stockPrice,
    } = params;
    await this.prisma.$transaction(async (tx) => {
      const stocks = await tx.stock.findMany({
        include: {
          stockPrice: true,
          initialPlan: true,
        },
        where: {
          companyId,
          planId,
          productId,
          packagingId,
          grammage,
          sizeX,
          sizeY: sizeY || 0,
          paperColorGroupId,
          paperColorId,
          paperPatternId,
          paperCertId,
          warehouseId: null,
        },
      });
      if (stocks.length === 0)
        throw new NotFoundException(`존재하지 않는 도착예정재고 입니다.`);

      const storingStock = stocks.find(
        (stock) => stock.planId === stock.initialPlanId,
      );

      // TODO: 재고유형, 금액단위 체크

      // 금액 업데이트
      await tx.stockPrice.update({
        where: {
          stockId: storingStock.id,
        },
        data: {
          ...stockPrice,
        },
      });
    });
  }
}
