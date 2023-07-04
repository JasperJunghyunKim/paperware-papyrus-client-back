import { BadRequestException } from '@nestjs/common';
import {
  DepositType,
  DiscountType,
  OfficialPriceType,
  PriceUnit,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
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
  MaxLength,
  Min,
  NotEquals,
  ValidateNested,
} from 'class-validator';
import { isLength } from 'lodash';
import {
  OrderStockCreateRequest,
  OrderStockUpdateRequest,
  OrderListQuery,
  OrderStockArrivalListQuery,
  OrderStockArrivalCreateRequest,
  StockCreateStockPriceRequest,
  OrderStockTradeAltBundleUpdateRequest,
  OrderStockTradePriceUpdateRequest,
  TradePriceUpdateRequest,
  OrderDepositCreateRequest,
  OrderStockAssignStockRequest,
  OrderStockAssignStockUpdateRequest,
  OrderDepositListQuery,
  DepositCreateRequest,
  OrderDepositAssignDepositCreateRequest,
  OrderDepositAssignDepositUpdateRequest,
  OrderProcessCreateRequest,
  OrderEtcCreateRequest,
  OrderProcessInfoUpdateRequest,
  OrderProcessStockUpdateRequest,
  OrderEtcUpdateRequest,
  OrderDepositUpdateAssignRequest,
} from 'src/@shared/api';
import { StockCreateStockPriceDto } from 'src/modules/stock/api/dto/stock.request';

export class OrderListQueryDto implements OrderListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip = 0;

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
export default class OrderStockCreateRequestDto
  implements OrderStockCreateRequest
{
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
  warehouseId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  planId: number | null = null;

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
  sizeY = 0;

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
  @Min(0)
  quantity: number = 0;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  memo = '';

  @IsString()
  wantedDate: string;

  @IsDateString()
  orderDate: string;

  @IsOptional()
  @IsBoolean()
  isDirectShipping = false;
}

/** 정상거래 수정 요청 */
export class OrderStockUpdateRequestDto implements OrderStockUpdateRequest {
  @IsInt()
  @Type(() => Number)
  locationId: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  memo = '';

  @IsString()
  wantedDate: string;

  @IsDateString()
  orderDate: string;

  @IsOptional()
  @IsBoolean()
  isDirectShipping: boolean = undefined;
}

export class OrderStockArrivalListQueryDto
  implements OrderStockArrivalListQuery
{
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take: number = undefined;
}

export class OrderStockArrivalCreateRequestDto
  implements OrderStockArrivalCreateRequest
{
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
  sizeY = 0;

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
  @IsBoolean()
  isSyncPrice = false;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StockCreateStockPriceDto)
  stockPrice: StockCreateStockPriceDto = null;

  validate() {
    if (!this.isSyncPrice) this.isSyncPrice = false;
    if (!this.isSyncPrice && !this.stockPrice) {
      throw new BadRequestException(
        `매입금액 동기화 미사용시 재고금액을 입력해야합니다.`,
      );
    }
    if (this.isSyncPrice) this.stockPrice = null;
  }
}

export class OrderIdDto {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly orderId: number;
}

export class IdDto {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly id: number;
}

/** 거래금액 수정 */
export class UpdateOrderStockTradeAltBundleDto
  implements OrderStockTradeAltBundleUpdateRequest
{
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly altSizeX: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly altSizeY: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly altQuantity: number;
}

export class UpdateOrderStockTradePriceDto
  implements OrderStockTradePriceUpdateRequest
{
  @IsEnum(OfficialPriceType)
  readonly officialPriceType: OfficialPriceType;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly officialPrice: number;

  @IsEnum(PriceUnit)
  readonly officialPriceUnit: PriceUnit;

  @IsEnum(DiscountType)
  readonly discountType: DiscountType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  readonly discountPrice: number = 0;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  readonly unitPrice: number = 0;

  @IsEnum(PriceUnit)
  readonly unitPriceUnit: PriceUnit;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly processPrice: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateOrderStockTradeAltBundleDto)
  readonly orderStockTradeAltBundle: UpdateOrderStockTradeAltBundleDto | null =
    null;
}

export class UpdateOrderDepositTradeAltBundleDto
  implements OrderStockTradeAltBundleUpdateRequest
{
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly altSizeX: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly altSizeY: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly altQuantity: number;
}

export class UpdateOrderDepositTradePriceDto
  implements OrderStockTradePriceUpdateRequest
{
  @IsEnum(OfficialPriceType)
  readonly officialPriceType: OfficialPriceType;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly officialPrice: number;

  @IsEnum(PriceUnit)
  readonly officialPriceUnit: PriceUnit;

  @IsEnum(DiscountType)
  readonly discountType: DiscountType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  readonly discountPrice: number = 0;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  readonly unitPrice: number = 0;

  @IsEnum(PriceUnit)
  readonly unitPriceUnit: PriceUnit;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly processPrice: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateOrderDepositTradeAltBundleDto)
  readonly orderDepositTradeAltBundle: UpdateOrderDepositTradeAltBundleDto | null =
    null;
}

export class UpdateTradePriceDto implements TradePriceUpdateRequest {
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  readonly suppliedPrice: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  readonly vatPrice: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateOrderStockTradePriceDto)
  readonly orderStockTradePrice: UpdateOrderStockTradePriceDto | null = null;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateOrderDepositTradePriceDto)
  readonly orderDepositTradePrice: UpdateOrderDepositTradePriceDto | null =
    null;
}

/** 보관등록 */
export class OrderDepositCreateDto implements OrderDepositCreateRequest {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly srcCompanyId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly dstCompanyId: number;

  @IsDateString()
  readonly orderDate: string;

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

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly quantity: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly memo: string = '';
}

/** 보관 매입/매출 원지 수정 */
export class OrderDepositUpdateAssignDto
  implements OrderDepositUpdateAssignRequest
{
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
  @Type(() => Number)
  @Min(0)
  readonly sizeY: number = 0;

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

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly quantity: number;
}

/** 보관량 목록 */
export class OrderDepositListQueryDto implements OrderDepositListQuery {
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

  @IsEnum(DepositType)
  readonly type: DepositType;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string | null = null;
}

/** 보관량 증감*/
export class DepositCreateDto implements DepositCreateRequest {
  @IsEnum(DepositType)
  readonly type: DepositType;

  @IsString()
  @Length(10, 10)
  readonly partnerCompanyRegistrationNumber: string;

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

  @IsInt()
  @Type(() => Number)
  @NotEquals(0)
  readonly quantity: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly memo: string = '';
}

/** 원지 수정 */
export class OrderStockAssignStockUpdateRequestDto
  implements OrderStockAssignStockUpdateRequest
{
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  warehouseId: number | null = null;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  planId: number | null = null;
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
  @Min(0)
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
  @Min(0)
  quantity: number = 0;
}

/** 보관매입/매출 등록 */
export class OrderDepositAssignDepositCreateDto
  implements OrderDepositAssignDepositCreateRequest
{
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly depositId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly quantity: number;
}

/** 보관매입/매출 수정 */
export class OrderDepositAssignDepositQuantityUpdateDto
  implements OrderDepositAssignDepositUpdateRequest
{
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly depositId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly quantity: number;
}

/** 외주공정 등록 */
export class OrderProcessCreateDto implements OrderProcessCreateRequest {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly srcCompanyId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly dstCompanyId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly srcLocationId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly dstLocationId: number;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  readonly memo: string = '';

  @IsDateString()
  readonly srcWantedDate: string;

  @IsDateString()
  readonly dstWantedDate: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly warehouseId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly planId: number | null = null;

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

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly quantity: number;

  @IsDateString()
  readonly orderDate: string;

  @IsOptional()
  @IsBoolean()
  readonly isSrcDirectShipping: boolean = false;

  @IsOptional()
  @IsBoolean()
  readonly isDstDirectShipping: boolean = false;
}

/** 외주공정 정보 업데이트 */
export class OrderProcessInfoUpdateDto
  implements OrderProcessInfoUpdateRequest
{
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly srcLocationId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly dstLocationId: number;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  readonly memo: string = '';

  @IsDateString()
  readonly srcWantedDate: string;

  @IsDateString()
  readonly dstWantedDate: string;

  @IsDateString()
  readonly orderDate: string;

  @IsOptional()
  @IsBoolean()
  readonly isSrcDirectShipping: boolean = false;

  @IsOptional()
  @IsBoolean()
  readonly isDstDirectShipping: boolean = false;
}

export class OrderProcessStockUpdateDto
  implements OrderProcessStockUpdateRequest
{
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly warehouseId: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly planId: number | null = null;

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

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly quantity: number;
}

/** 기타매입/매출 등록 */
export class OrderEtcCreateDto implements OrderEtcCreateRequest {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly srcCompanyId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly dstCompanyId: number;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  readonly item: string = '';

  @IsOptional()
  @IsString()
  @Length(0, 300)
  readonly memo: string = '';

  @IsDateString()
  readonly orderDate: string;
}

export class OrderEtcUpdateDto implements OrderEtcUpdateRequest {
  @IsOptional()
  @IsString()
  @Length(0, 300)
  readonly item: string = '';

  @IsOptional()
  @IsString()
  @Length(0, 300)
  readonly memo: string = '';

  @IsDateString()
  readonly orderDate: string;
}
