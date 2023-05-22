import { DiscountType, OfficialPriceType, PriceUnit } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  OrderStockCreateRequest,
  OrderStockUpdateRequest,
  OrderListQuery,
  OrderStockArrivalListQuery,
  OrderStockArrivalCreateRequest,
  StockCreateStockPriceRequest,
  OrderStockTradeAltBundleUpdateRequest,
  OrderStockTradePriceUpdateRequest,
  TradePriceUpdateRequest,
} from 'src/@shared/api';
import { StockCreateStockPriceDto } from 'src/modules/stock/api/dto/stock.request';

export class OrderListQueryDto implements OrderListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take: number = undefined;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  srcCompanyId: number = undefined;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  dstCompanyId: number = undefined;
}

/** 정상거래 등록 요청 */
export default class OrderStockCreateRequestDto
  implements OrderStockCreateRequest {
  @IsInt()
  @Type(() => Number)
  srcCompanyId: number;

  @IsInt()
  @Type(() => Number)
  dstCompanyId: number;

  @IsInt()
  @Type(() => Number)
  locationId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  warehouseId: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  orderStockId: number = null;

  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsInt()
  @Type(() => Number)
  packagingId: number;

  @IsInt()
  @Type(() => Number)
  grammage: number;

  @IsInt()
  @Type(() => Number)
  sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sizeY = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperCertId: number | null = null;

  @IsInt()
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  memo = '';

  @IsString()
  wantedDate: string;
}

/** 정상거래 수정 요청 */
export class OrderStockUpdateRequestDto implements OrderStockUpdateRequest {
  @IsInt()
  @Type(() => Number)
  locationId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  warehouseId: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  orderStockId: number = null;

  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsInt()
  @Type(() => Number)
  packagingId: number;

  @IsInt()
  @Type(() => Number)
  grammage: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sizeX = 0;

  @IsInt()
  @Type(() => Number)
  sizeY: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperCertId: number | null = null;

  @IsInt()
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  memo = '';

  @IsString()
  wantedDate: string;
}

export class OrderStockArrivalListQueryDto
  implements OrderStockArrivalListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take: number = undefined;
}

export class OrderStockArrivalCreateRequestDto
  implements OrderStockArrivalCreateRequest {
  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsInt()
  @Type(() => Number)
  packagingId: number;

  @IsInt()
  @Type(() => Number)
  grammage: number;

  @IsInt()
  @Type(() => Number)
  sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sizeY = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperCertId: number | null = null;

  @IsInt()
  @Type(() => Number)
  quantity: number;

  @IsBoolean()
  isSyncPrice: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => StockCreateStockPriceDto)
  stockPrice: StockCreateStockPriceDto;
}

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
  @IsEnum(OfficialPriceType)
  readonly officialPriceType: OfficialPriceType;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly officialPrice: number;

  @IsEnum(PriceUnit)
  readonly officialPriceUnit: PriceUnit;

  @IsEnum(DiscountType)
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

  @IsEnum(PriceUnit)
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