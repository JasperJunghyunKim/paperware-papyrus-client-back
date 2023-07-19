import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  OrderRequestCreateRequest,
  OrderRequestListQuery,
} from 'src/@shared/api/trade/order-request.request';

/** 퀵주문 목록 */
export class OrderRequestListDto implements OrderRequestListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = 30;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly srcCompanyId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly dstCompanyId: number | null = null;
}

/** 퀵주문 생성 */
export class OrderRequestCreateItemDto {
  @IsString()
  @Length(1, 200)
  readonly item: string;

  @ValidateIf((obj, val) => val !== '')
  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly quantity: string = '';

  @ValidateIf((obj, val) => val !== '')
  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly memo: string = '';
}

export class OrderRequestCreateDto implements OrderRequestCreateRequest {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly dstCompanyId: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly locationId: number = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsDateString()
  readonly wantedDate: string = null;

  @ValidateIf((obj, val) => val !== '')
  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly memo: string = '';

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => OrderRequestCreateItemDto)
  readonly orderRequestItems: OrderRequestCreateItemDto[];
}
