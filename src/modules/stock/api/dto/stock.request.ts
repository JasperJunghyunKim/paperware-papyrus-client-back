import { DiscountType, OfficialPriceType, PriceUnit } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsDateString,
	IsEnum,
	IsInt,
	IsNumber,
	IsObject,
	IsOptional,
	IsPositive,
	Max,
	Min,
	NotEquals,
	ValidateNested,
} from 'class-validator';
import {
	ArrivalStockCreateRequest,
	StockCreateRequest,
	StockCreateStockPriceRequest,
	StockGroupDetailQuery,
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
	readonly sizeY: number;

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

	@IsObject()
	@ValidateNested()
	@Type(() => StockCreateStockPriceDto)
	readonly stockPrice: StockCreateStockPriceDto;

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