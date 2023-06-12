import { BadRequestException, Injectable, NotImplementedException } from "@nestjs/common";
import { DiscountType, OfficialPriceType, PackagingType, PriceUnit } from "@prisma/client";

type altPackagingType = 'ROLL' | 'SHEET';

interface TradePrice {
  suppliedPrice: number;
  vatPrice: number;
  orderStockTradePrice?: {
    officialPriceType: OfficialPriceType;
    officialPrice: number;
    officialPriceUnit: PriceUnit;
    discountType: DiscountType;
    discountPrice: number;
    unitPrice: number;
    unitPriceUnit: PriceUnit;
    processPrice: number;
    orderStockTradeAltBundle?: {
      altSizeX: number;
      altSizeY: number;
      altQuantity: number;
    }
  }
}

interface OrderStockTradePrice {
  officialPriceType: OfficialPriceType;
  officialPrice: number;
  officialPriceUnit: PriceUnit;
  discountType: DiscountType;
  discountPrice: number;
  unitPrice: number;
  unitPriceUnit: PriceUnit;
  processPrice: number;
  orderStockTradeAltBundle?: {
    altSizeX: number;
    altSizeY: number;
    altQuantity: number;
  }
}

interface OrderDepositTradePrice {
  officialPriceType: OfficialPriceType;
  officialPrice: number;
  officialPriceUnit: PriceUnit;
  discountType: DiscountType;
  discountPrice: number;
  unitPrice: number;
  unitPriceUnit: PriceUnit;
  processPrice: number;
  orderStockTradeAltBundle?: {
    altSizeX: number;
    altSizeY: number;
    altQuantity: number;
  }
}


@Injectable()
export class TradePriceValidator {
  validateOrderStockTradePrice(packagingType: PackagingType, orderStockTradePrice: OrderStockTradePrice) {
    if (!orderStockTradePrice) throw new BadRequestException(`거래금액을 입력해야 합니다.`);

    const altBundle = orderStockTradePrice.orderStockTradeAltBundle || null;

    if (altBundle) {

    } else {

    }

    switch (orderStockTradePrice.officialPriceType) {
      // TODO...
      case 'MANUAL_NONE':
      case 'NONE':
      case 'RETAIL':
      case 'WHOLESALE':
        return;
      default:
        return;
    }
  }

  validateOrderDepositTradePrice(packagingType: PackagingType, orderDepositTradePrice: OrderDepositTradePrice) {
    if (!orderDepositTradePrice) throw new BadRequestException(`거래금액을 입력해야 합니다.`);

    const altBundle = orderDepositTradePrice.orderStockTradeAltBundle || null;

    if (altBundle) {

    } else {

    }

    switch (orderDepositTradePrice.officialPriceType) {
      // TODO...
      case 'MANUAL_NONE':
      case 'NONE':
      case 'RETAIL':
      case 'WHOLESALE':
        return;
      default:
        return;
    }
  }
}