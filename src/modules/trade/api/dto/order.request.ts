import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  OrderStockCreateRequest,
  OrderStockUpdateRequest,
  OrderListQuery,
} from 'src/@shared/api';

export class OrderListQueryDto implements OrderListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take: number = undefined;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  srcCompanyId: number = undefined;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  dstCompanyId: number = undefined;
}

/** 정상거래 등록 요청 */
export class OrderStockCreateRequestDto implements OrderStockCreateRequest {
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
  productId: number;

  @IsInt()
  @Type(() => Number)
  packagingId: number;

  @IsInt()
  @Type(() => Number)
  grammage: number;

  @IsInt()
  @Type(() => Number)
  sizeX: number;

  @IsInt()
  @Type(() => Number)
  sizeY: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorGroupId: number | null = null;

  @IsInt()
  @Type(() => Number)
  paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperCertId: number | null = null;

  @IsInt()
  @Type(() => Number)
  quantity: number;

  @IsString()
  @MaxLength(100)
  memo: string;

  @IsString()
  wantedDate: string;
}

/** 정상거래 수정 요청 */
export class OrderStockUpdateRequestDto implements OrderStockUpdateRequest {
  @IsInt()
  @Type(() => Number)
  locationId: number;

  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsInt()
  @Type(() => Number)
  packagingId: number;

  @IsInt()
  @Type(() => Number)
  grammage: number;

  @IsInt()
  @Type(() => Number)
  sizeX: number;

  @IsInt()
  @Type(() => Number)
  sizeY: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorGroupId: number | null = null;

  @IsInt()
  @Type(() => Number)
  paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperCertId: number | null = null;

  @IsInt()
  @Type(() => Number)
  quantity: number;

  @IsString()
  @MaxLength(100)
  memo: string;

  @IsString()
  wantedDate: string;
}
