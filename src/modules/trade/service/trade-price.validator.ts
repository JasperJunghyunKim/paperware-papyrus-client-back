import { Injectable, NotImplementedException } from "@nestjs/common";
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


@Injectable()
export class TradePriceValidator {

    validateTradePrice(packagingType: PackagingType, tradePrice: TradePrice) {
        if (!tradePrice.orderStockTradePrice) return;

        const orderStockTradePrice = tradePrice.orderStockTradePrice;
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
}