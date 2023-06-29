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
    isSyncPrice: boolean;
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
      isSyncPrice,
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
      if (
        isSyncPrice &&
        (storingStock.initialPlan.type === 'INHOUSE_CREATE' ||
          storingStock.initialPlan.type === 'INHOUSE_PROCESS' ||
          storingStock.initialPlan.type === 'INHOUSE_STOCK_QUANTITY_CHANGE' ||
          storingStock.initialPlan.type === 'INHOUSE_MODIFY' ||
          storingStock.initialPlan.type === 'INHOUSE_RELOCATION')
      )
        throw new BadRequestException(
          `금액동기화를 적용할 수 없는 도착예정재고입니다.`,
        );

      // TODO: 재고유형, 금액단위 체크

      // isSyncPrice
      await tx.stock.updateMany({
        data: {
          isSyncPrice,
        },
        where: {
          id: {
            in: stocks.map((stock) => stock.id),
          },
        },
      });

      // 기존금액 삭제
      await tx.stockPrice.deleteMany({
        where: {
          stockId: {
            in: stocks.map((stock) => stock.id),
          },
        },
      });

      // 금액동기화가 아닌경우 금액 생성
      if (!isSyncPrice) {
        await tx.stockPrice.createMany({
          data: stocks.map((stock) => ({
            stockId: stock.id,
            ...stockPrice,
          })),
        });
      }
    });
  }
}
