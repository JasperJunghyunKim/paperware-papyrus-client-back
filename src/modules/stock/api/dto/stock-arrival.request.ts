import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { StockArrivalApplyRequest, StockArrivalListQuery } from 'src/@shared/api';

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

export class StockArrivalApplyDto implements StockArrivalApplyRequest {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly warehouseId: number;
}