import { DiscountType, OfficialPriceType, PriceUnit } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  StockCreateRequest,
  StockCreateStockPriceRequest,
  StockGroupListQuery,
  StockListQuery,
} from 'src/@shared/api/stock/stock.request';

/** 자사 재고그룹 목록 조회 */
export class StockGroupListRequestDto implements StockGroupListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = undefined;
}

/** 자사 재고목록 조회 */
export class StockListRequestDto implements StockListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly warehouseId: number = null;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly productId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly packagingId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly grammage: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorGroupId: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorId: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperPatternId: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperCertId: number = null;
}

/** 재고 상세조회 */
export class GetStockDto {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly stockId: number;
}

/** 재고생성 (신규등록) */
export class StockCreateStockPriceDto implements StockCreateStockPriceRequest {
  @IsEnum(OfficialPriceType)
  readonly officialPriceType: OfficialPriceType;

  @IsNumber()
  @Min(0)
  readonly officialPrice: number;

  @IsEnum(PriceUnit)
  readonly officialPriceUnit: PriceUnit;

  @IsEnum(DiscountType)
  readonly discountType: DiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly discountPrice: number = null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly unitPrice: number = null;

  @IsEnum(PriceUnit)
  readonly unitPriceUnit: PriceUnit;
}

export class StockCreateRequestDto implements StockCreateRequest {
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly warehouseId: number | null = null;

  @IsInt()
  @IsPositive()
  readonly productId: number;

  @IsInt()
  @IsPositive()
  readonly packagingId: number;

  @IsInt()
  @IsPositive()
  readonly grammage: number;

  @IsInt()
  @IsPositive()
  readonly sizeX: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperCertId: number | null = null;

  @IsNumber()
  @IsPositive()
  readonly quantity: number;

  @IsObject()
  @ValidateNested()
  @Type(() => StockCreateStockPriceDto)
  readonly stockPrice: StockCreateStockPriceDto;
}
