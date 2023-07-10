import { BadRequestException } from '@nestjs/common';
import { OfficialPriceType, PriceUnit, DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  StockArrivalApplyRequest,
  StockArrivalDetailQuery,
  StockArrivalListQuery,
  StockArrivalPriceUpdateRequest,
} from 'src/@shared/api';

export class StockArrivalListQueryDto implements StockArrivalListQuery {
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

export class StockArrivalDetailDto implements StockArrivalDetailQuery {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly planId: number;

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
  @Min(0)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperCertId: number | null = null;
}

export class StockArrivalApplyDto implements StockArrivalApplyRequest {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly warehouseId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly planId: number;

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
  @Min(0)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperCertId: number | null = null;
}

/** 도착예정재고 금액수정 */
export class StockArrivalPriceUpdateStockPrice {
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

export class StockArrivalPriceUpdateDto
  implements StockArrivalPriceUpdateRequest
{
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly planId: number;

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
  @Min(0)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperCertId: number | null = null;

  @ValidateIf((obj) => !obj.isSyncPrice)
  @IsObject()
  @ValidateNested()
  @Type(() => StockArrivalPriceUpdateStockPrice)
  stockPrice: StockArrivalPriceUpdateStockPrice = null;
}
