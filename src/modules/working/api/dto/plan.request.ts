import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import {
  PlanCreateRequest,
  PlanListQuery,
  PlanListQueryType,
  RegisterInputStockRequest as RegisterInputStockRequest,
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

export class RegisterInputStockRequestDto implements RegisterInputStockRequest {
  @IsInt()
  @IsPositive()
  readonly stockId: number;

  @IsInt()
  @IsPositive()
  readonly quantity: number;
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
