import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import {
  OrderStockCreateRequest,
  OrderStockUpdateRequest,
  OrderListQuery,
  OrderStockArrivalListQuery,
  OrderStockArrivalCreateRequest,
  StockCreateStockPriceRequest,
} from 'src/@shared/api';
import { StockCreateStockPriceDto } from 'src/modules/stock/api/dto/stock.request';

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
export default class OrderStockCreateRequestDto implements OrderStockCreateRequest {
  @IsInt()
  @Type(() => Number)
  srcCompanyId: number;

  @IsInt()
  @Type(() => Number)
  dstCompanyId: number;

  @IsInt()
  @Type(() => Number)
  locationId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  warehouseId: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  orderStockId: number = null;

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

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorGroupId: number | null = null;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  memo: string = '';

  @IsString()
  wantedDate: string;
}

/** 정상거래 수정 요청 */
export class OrderStockUpdateRequestDto implements OrderStockUpdateRequest {
  @IsInt()
  @Type(() => Number)
  locationId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  warehouseId: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  orderStockId: number = null;

  @IsInt()
  @Type(() => Number)
  productId: number;

  @IsInt()
  @Type(() => Number)
  packagingId: number;

  @IsInt()
  @Type(() => Number)
  grammage: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sizeX: number = 0;

  @IsInt()
  @Type(() => Number)
  sizeY: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorGroupId: number | null = null;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  memo: string = '';

  @IsString()
  wantedDate: string;
}

export class OrderStockArrivalListQueryDto implements OrderStockArrivalListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take: number = undefined;
}

export class OrderStockArrivalCreateRequestDto implements OrderStockArrivalCreateRequest {
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

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paperColorGroupId: number | null = null;

  @IsOptional()
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

  @IsObject()
  @ValidateNested()
  @Type(() => StockCreateStockPriceDto)
  stockPrice: StockCreateStockPriceDto;
}
