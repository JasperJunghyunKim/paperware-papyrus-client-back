import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  DiscountType,
  OfficialPriceType,
  OrderStockTradeAltBundle,
  OrderStockTradePrice,
  Packaging,
  PackagingType,
  PlanType,
  PriceUnit,
  Stock,
  TradePrice,
} from '@prisma/client';

interface StockPrice {
  officialPriceType: OfficialPriceType;
  officialPrice: number;
  officialPriceUnit: PriceUnit;
  discountType: DiscountType;
  discountPrice: number;
  unitPrice: number;
  unitPriceUnit: PriceUnit;
}

@Injectable()
export class StockValidator {
  private readonly MAX_ROLL_QUANTITY = 100 * 1000000;
  private readonly MAX_SHEET_QUANTITY = 5000000;

  validateQuantity(packaging: Packaging, quantity: number) {
    if (!packaging || !quantity)
      throw new InternalServerErrorException(
        'packaging and quantity are required',
      );
    if (packaging.type === PackagingType.ROLL) {
      if (quantity > this.MAX_ROLL_QUANTITY)
        throw new BadRequestException(
          `ROLL 재고의 최대 등록 중량은 ${this.MAX_ROLL_QUANTITY} 입니다.`,
        );
    } else {
      if (!Number.isInteger(quantity))
        throw new BadRequestException(
          `SHEET 재고의 수량은 정수단위로 입력하셔야 합니다.`,
        );
      if (quantity > this.MAX_SHEET_QUANTITY)
        throw new BadRequestException(
          `SHEET 재고의 최대 등록 수량은 ${this.MAX_SHEET_QUANTITY} 입니다.`,
        );
    }
  }

  validateStockPrice(packagingType: PackagingType, stockPrice: StockPrice) {
    if (!stockPrice) return;

    switch (packagingType) {
      case 'ROLL':
        if (
          stockPrice.officialPriceUnit !== 'WON_PER_TON' ||
          stockPrice.unitPriceUnit !== 'WON_PER_TON'
        ) {
          throw new BadRequestException(
            `ROLL 재고는 원/T 단위만 설정 가능합니다.`,
          );
        }
        break;
      case 'BOX':
        break;
      default:
        if (
          stockPrice.officialPriceUnit === 'WON_PER_BOX' ||
          stockPrice.unitPriceUnit === 'WON_PER_BOX'
        ) {
          throw new BadRequestException(
            `BOX 재고 이외에는 원/Box 단위로 설정불가능 합니다.`,
          );
        }
        break;
    }
  }

  validateIsSyncPrice(
    isSyncPrice: boolean,
    initialPlanType: PlanType,
    stock: Stock,
    assignStock: Stock,
    tradePrice:
      | (TradePrice & {
          orderStockTradePrice: OrderStockTradePrice & {
            orderStockTradeAltBundle: OrderStockTradeAltBundle;
          };
        })
      | null,
  ) {
    if (!isSyncPrice) return;

    // 외주공정 또는 기타거래와 같이 공급가, 부가세로만 구성된 거래의 경우 불가 → ‘단가’가 없으므로
    if (initialPlanType !== 'TRADE_NORMAL_BUYER') {
      throw new BadRequestException(
        `정상매입을 통해 생성된 도착예정재고만 매입금액 동기화가 가능합니다.`,
      );
    }

    // 원지정보와 예정재고의 스펙이 다를 경우 → 스펙이 다르다는 것은 공정이 적용되어 입고되는 것이므로 동기화 불가
    if (
      assignStock.packagingId !== stock.packagingId ||
      assignStock.productId !== stock.productId ||
      assignStock.grammage !== stock.grammage ||
      assignStock.sizeX !== stock.sizeX ||
      assignStock.sizeY !== stock.sizeY ||
      assignStock.paperColorGroupId !== stock.paperColorGroupId ||
      assignStock.paperColorId !== stock.paperColorId ||
      assignStock.paperPatternId !== stock.paperPatternId ||
      assignStock.paperCertId !== stock.paperCertId
    ) {
      throw new BadRequestException(
        `공정과정을 포함한 재고는 매입금액 동기화가 불가능합니다.`,
      );
    }

    // 단가대체 적용되었을 경우 → 원지정보와 예정재고 스펙이 일치하더라도 단가대체될 경우 거래금액의 단가가 달라지므로 동기화 불가
    if (
      tradePrice &&
      tradePrice.orderStockTradePrice &&
      tradePrice.orderStockTradePrice.orderStockTradeAltBundle
    ) {
      throw new BadRequestException(
        `주문금액 정보에 단가대체가 적용되어있는 경우 매입금액 동기화가 불가능합니다.`,
      );
    }
  }
}
