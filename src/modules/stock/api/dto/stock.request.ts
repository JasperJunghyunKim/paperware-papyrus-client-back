import { BadRequestException } from '@nestjs/common';
import { DiscountType, OfficialPriceType, PriceUnit } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsBooleanString,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  NotEquals,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  ArrivalStockCreateRequest,
  ArrivalStockDeleteQuery,
  ArrivalStockPriceQuery,
  ArrivalStockPriceUpdateRequest,
  ArrivalStockSpecUpdateRequest,
  StockCreateRequest,
  StockCreateStockPriceRequest,
  StockGroupDetailQuery,
  StockGroupHistoryQuery,
  StockGroupListQuery,
  StockGroupQuantityQuery,
  StockListQuery,
  StockQuantityChangeRequest,
} from 'src/@shared/api/stock/stock.request';
import { IsAnyOrId } from 'src/validator/is-any-or-id';

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

  @IsOptional()
  @IsAnyOrId()
  readonly planId: number | 'any' = undefined;

  @IsOptional()
  @IsBooleanString()
  readonly isDirectShippingIncluded: 'true' | 'false' = 'false';

  @IsOptional()
  @IsBooleanString()
  readonly isZeroQuantityIncluded: 'true' | 'false' = 'false';

  @IsOptional()
  @IsBooleanString()
  readonly orderProcessIncluded: 'true' | 'false' = 'false';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  readonly initialPlanId: number = null;

  // 검색 필드
  @IsOptional()
  @IsString()
  readonly warehouseIds: string = '';

  @IsOptional()
  @IsString()
  readonly packagingIds: string = '';

  @IsOptional()
  @IsString()
  readonly paperTypeIds: string = '';

  @IsOptional()
  @IsString()
  readonly manufacturerIds: string = '';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly minGrammage: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly maxGrammage: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeX: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeY: number = null;

  @IsOptional()
  @IsString()
  readonly partnerCompanyRegistrationNumbers: string = '';

  @IsOptional()
  @IsString()
  readonly locationIds: string = '';

  @IsOptional()
  @IsDateString()
  readonly minWantedDate: string | null = null;

  @IsOptional()
  @IsDateString()
  readonly maxWantedDate: string | null = null;
}

/** 자사 재고 히스토리 조회 */
export class StockGroupHistoryDto implements StockGroupHistoryQuery {
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
  readonly take: number = 30;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly warehouseId: number | null = null;

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
  readonly sizeY: number | null = null;

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
  @Min(0)
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

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly planId: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  readonly initialPlanId: number = null;

  @IsOptional()
  @IsBooleanString()
  readonly isZeroQuantityIncluded: 'true' | 'false' = 'false';
}

/** 재고 상세조회 */
export class GetStockDto {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly stockId: number;
}

export class GetStockBySerialDto {
  @IsString()
  @Length(10)
  readonly serial: string;
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
  readonly sizeY: number;

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

export class ArrivalStockCreateRequestDto implements ArrivalStockCreateRequest {
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
  readonly sizeY: number;

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

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StockCreateStockPriceDto)
  readonly stockPrice: StockCreateStockPriceDto = null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly dstLocationId: number;

  @IsDateString()
  readonly wantedDate: string;
}

/** deprecated */
export class StockGroupQuantityQueryDto implements StockGroupQuantityQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly warehouseId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly planId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly productId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly packagingId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly grammage: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperCertId: number | null = null;
}

/** 재고그룹 상세 조회 */
export class StockGroupDetailDto implements StockGroupDetailQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly warehouseId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly planId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly productId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly packagingId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly grammage: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperCertId: number | null = null;
}

/** 재고 증감 */
export class StockQuantityChangeDto implements StockQuantityChangeRequest {
  @IsInt()
  @Type(() => Number)
  @NotEquals(0)
  readonly quantity: number;
}

export class IdDto {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly id: number;
}

/** 도착예정재고 금액 */
export class ArrivalStockPriceGetDto implements ArrivalStockPriceQuery {
  @IsInt()
  @Type(() => Number)
  readonly planId: number;

  @IsInt()
  @Type(() => Number)
  readonly productId: number;

  @IsInt()
  @Type(() => Number)
  readonly packagingId: number;

  @IsInt()
  @Type(() => Number)
  readonly grammage: number;

  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperCertId: number | null = null;
}

/** 도착예정재고 금액 수정 */
export class ArrivalStockPriceUpdateStockPriceDto {
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

export class ArrivalStockPriceUpdateDto
  implements ArrivalStockPriceUpdateRequest
{
  @IsInt()
  @Type(() => Number)
  readonly initialPlanId: number;

  @IsInt()
  @Type(() => Number)
  readonly productId: number;

  @IsInt()
  @Type(() => Number)
  readonly packagingId: number;

  @IsInt()
  @Type(() => Number)
  readonly grammage: number;

  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperCertId: number | null = null;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ArrivalStockPriceUpdateStockPriceDto)
  stockPrice: ArrivalStockPriceUpdateStockPriceDto = null;
}

/** 도착예정재고 스펙 수정 */
export class StockSpec {
  @IsInt()
  @Type(() => Number)
  readonly productId: number;

  @IsInt()
  @Type(() => Number)
  readonly packagingId: number;

  @IsInt()
  @Type(() => Number)
  readonly grammage: number;

  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperCertId: number | null = null;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly quantity: number;
}

export class ArrivalStockSpecUpdateDto
  implements ArrivalStockSpecUpdateRequest
{
  @IsInt()
  @Type(() => Number)
  readonly planId: number;

  @IsInt()
  @Type(() => Number)
  readonly productId: number;

  @IsInt()
  @Type(() => Number)
  readonly packagingId: number;

  @IsInt()
  @Type(() => Number)
  readonly grammage: number;

  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperCertId: number | null = null;

  @IsObject()
  @ValidateNested()
  readonly spec: StockSpec;
}

/** 도착예정재고 스펙 삭제 */
export class ArrivalStockDeleteDto implements ArrivalStockDeleteQuery {
  @IsInt()
  @Type(() => Number)
  readonly planId: number;

  @IsInt()
  @Type(() => Number)
  readonly productId: number;

  @IsInt()
  @Type(() => Number)
  readonly packagingId: number;

  @IsInt()
  @Type(() => Number)
  readonly grammage: number;

  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperCertId: number | null = null;
}
