import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsBooleanString,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  DeleteInputStockRequest,
  PlanCreateRequest,
  PlanListQuery,
  PlanListQueryType,
  RegisterInputStockRequest as RegisterInputStockRequest,
  UpdateInputStockRequest,
} from 'src/@shared/api';

export class PlanListQueryDto implements PlanListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly take: number = undefined;
  @IsOptional()
  @Type(() => String)
  readonly type: PlanListQueryType = 'DEFAULT';

  /// 검색
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly planNo: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly convertingStatus: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly guillotineStatus: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly releaseStatus: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly partnerCompanyRegistrationNumbers: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsDateString()
  readonly minWantedDate: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsDateString()
  readonly maxWantedDate: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsBooleanString()
  readonly arrived: 'true' | 'false' | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly warehouseIds: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly packagingIds: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly paperTypeIds: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly manufacturerIds: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly minGrammage: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly maxGrammage: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly sizeX: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly sizeY: number | null = null;
}

export class PlanCreateRequestDto implements PlanCreateRequest {
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
  @IsInt()
  @Type(() => Number)
  readonly sizeY: number;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorGroupId: number = null;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperColorId: number = null;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperPatternId: number = null;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly paperCertId: number = null;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly warehouseId: number = null;
  @IsInt()
  @Type(() => Number)
  readonly quantity: number;
  @IsOptional()
  @Type(() => String)
  readonly memo: string = '';
}

/** 실투입재고 등록 */
export class RegisterInputStockRequestDto implements RegisterInputStockRequest {
  @IsInt()
  @IsPositive()
  readonly stockId: number;

  @ValidateIf((obj) => !obj.useRemainder)
  @IsInt()
  @IsPositive()
  readonly quantity: number | null = null;

  @IsOptional()
  @IsBoolean()
  readonly useRemainder: boolean | null = false;
}

/** 실투입재고 수량 변경 */
export class UpdateInputStockRequestDto implements UpdateInputStockRequest {
  @IsInt()
  @IsPositive()
  readonly stockId: number;

  @ValidateIf((obj) => !obj.useRemainder)
  @IsInt()
  @IsPositive()
  readonly quantity: number | null = null;

  @IsOptional()
  @IsBoolean()
  readonly useRemainder: boolean | null = false;
}

/** 실투입재고 취소 */
export class DeleteInputStockRequestDto implements DeleteInputStockRequest {
  @IsInt()
  @IsPositive()
  readonly stockId: number;
}

/** 실투입재고 상세 */
export class GetInputStockDto {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly id: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly stockId: number;
}

export class PlanInputListQueryDto implements PlanListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip = 0;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take: number = undefined;
}
