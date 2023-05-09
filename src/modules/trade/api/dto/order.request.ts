import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength } from 'class-validator';
import { OrderCreateRequest } from 'src/@shared/api';

/** 정상거래 등록 요청 */
export class OrderStockCreateRequestDto implements OrderCreateRequest {
  @IsInt()
  @Type(() => Number)
  srcCompanyId: number;

  @IsInt()
  @Type(() => Number)
  dstCompanyId: number;

  @IsInt()
  @Type(() => Number)
  locationId: number;

  @IsInt()
  @Type(() => Number)
  stockGroupId: number;

  @IsInt()
  @Type(() => Number)
  quantity: number;

  @IsString()
  @MaxLength(500)
  memo: string;

  @IsString()
  @MaxLength(10)
  wantedDate: string;
}
