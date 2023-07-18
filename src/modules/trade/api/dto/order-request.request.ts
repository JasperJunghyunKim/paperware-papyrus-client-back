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
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { OrderRequestCreateRequest } from 'src/@shared/api/trade/order-request.response';

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
