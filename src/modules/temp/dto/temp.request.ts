import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsPositive, Min, ValidateNested } from "class-validator";
import { DiscountType, DiscountTypes, OfficialPriceType, OfficialPriceTypes, OrderStockTradeAltBundleUpdateRequest, OrderStockTradePriceUpdateRequest, PriceUnit, PriceUnits, TradePriceUpdateRequest } from "src/@shared/api";

export class OrderIdDto {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly orderId: number;
}

/** 거래금액 수정 */
export class UpdateOrderStockTradeAltBundleDto implements OrderStockTradeAltBundleUpdateRequest {
    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly altSizeX: number;

    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly altSizeY: number;

    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly altQuantity: number;
}


export class UpdateOrderStockTradePriceDto implements OrderStockTradePriceUpdateRequest {
    @IsEnum(OfficialPriceTypes)
    readonly officialPriceType: OfficialPriceType;

    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly officialPrice: number;

    @IsEnum(PriceUnits)
    readonly officialPriceUnit: PriceUnit;

    @IsEnum(DiscountTypes)
    readonly discountType: DiscountType;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    readonly discountPrice: number = 0;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    readonly unitPrice: number = 0;

    @IsEnum(PriceUnits)
    readonly unitPriceUnit: PriceUnit;

    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly processPrice: number;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateOrderStockTradeAltBundleDto)
    readonly orderStockTradeAltBundle: UpdateOrderStockTradeAltBundleDto | null = null;
}

export class UpdateTradePriceDto implements TradePriceUpdateRequest {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly orderId: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly companyId: number;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    readonly suppliedPrice: number;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    readonly vatPrice: number;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateOrderStockTradePriceDto)
    readonly orderStockTradePrice: UpdateOrderStockTradePriceDto | null = null;
}