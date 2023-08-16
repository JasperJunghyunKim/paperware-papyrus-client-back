import { BadRequestException } from '@nestjs/common';
import { DiscountType, OfficialPriceType, PriceUnit } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsBooleanString,
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
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  OrderStockCreateRequest,
  OrderStockUpdateRequest,
  OrderListQuery,
  OrderStockArrivalListQuery,
  OrderStockArrivalCreateRequest,
  OrderStockTradeAltBundleUpdateRequest,
  OrderStockTradePriceUpdateRequest,
  TradePriceUpdateRequest,
  OrderDepositCreateRequest,
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
  OrderDepositUpdateRequest,
  OrderRefundCreateRequest,
  OrderReturnCreateRequest,
  OrderRefundUpdateRequest,
  OrderReturnUpdateRequest,
  OrderReturnUpdateStockRequest,
  OrderStockGroupCreateRequest,
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

  @IsOptional()
  @IsString()
  @Length(10, 10)
  readonly srcCompanyRegistrationNumber: string | null = null;

  @IsOptional()
  @IsBooleanString()
  readonly bookClosed: 'true' | 'false' | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly year: string | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(12)
  readonly month: string | null = null;

  /// 검색필드
  @IsOptional()
  @IsString()
  readonly orderTypes: string | null = null;

  @IsOptional()
  @IsString()
  readonly partnerCompanyRegistrationNumbers: string | null = null;

  @IsOptional()
  @IsString()
  readonly orderNo: string | null = null;

  @IsOptional()
  @IsString()
  readonly minOrderDate: string | null = null;

  @IsOptional()
  @IsString()
  readonly maxOrderDate: string | null = null;

  @IsOptional()
  @IsString()
  readonly minWantedDate: string | null = null;

  @IsOptional()
  @IsString()
  readonly maxWantedDate: string | null = null;

  @IsOptional()
  @IsString()
  readonly orderStatus: string | null = null;

  @IsOptional()
  @IsString()
  readonly taskStatus: string | null = null;

  @IsOptional()
  @IsString()
  readonly releaseStatus: string | null = null;

  @IsOptional()
  @IsString()
  readonly invoiceStatus: string | null = null;

  @IsOptional()
  @IsString()
  readonly packagingIds: string | null = null;

  @IsOptional()
  @IsString()
  readonly paperTypeIds: string | null = null;

  @IsOptional()
  @IsString()
  readonly manufacturerIds: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly minGrammage: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly maxGrammage: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeX: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeY: number | null = null;

  @IsOptional()
  @IsString()
  readonly bookCloseMethods: string | null = null;
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

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StockCreateStockPriceDto)
  stockPrice: StockCreateStockPriceDto = null;
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
  readonly suppliedPrice: number;

  @IsNumber()
  @Type(() => Number)
  readonly vatPrice: number;

  @IsOptional()
  @IsBoolean()
  readonly isSyncPrice: boolean = false;

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

/** 보관등록 공통정보 업데이트 */
export class OrderDepositUpdateDto implements OrderDepositUpdateRequest {
  @IsDateString()
  readonly orderDate: string;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  readonly srcCompanyRegistrationNumber: string | null = null;

  @IsOptional()
  @IsString()
  readonly dstCompanyRegistrationNumber: string | null = null;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string | null = null;

  // 검색 필드
  @IsOptional()
  @IsString()
  readonly packagingIds: string = '';

  @IsOptional()
  @IsString()
  readonly paperTypeIds: string = '';

  @IsOptional()
  @IsString()
  readonly manufacturerIds: string = '';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly minGrammage: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly maxGrammage: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeX: number = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeY: number = null;
}

/** 보관량 증감*/
export class DepositCreateDto implements DepositCreateRequest {
  @IsString()
  @Length(10, 10)
  readonly srcCompanyRegistrationNumber: string;

  @IsString()
  @Length(10, 10)
  readonly dstCompanyRegistrationNumber: string;

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

  @IsString()
  @Length(1, 200)
  readonly memo: string;
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
  readonly isSrcDirectShipping: boolean = undefined;

  @IsOptional()
  @IsBoolean()
  readonly isDstDirectShipping: boolean = undefined;
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

/** 환불 등록 */
export class OrderRefundCreateDto implements OrderRefundCreateRequest {
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

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  readonly originOrderNo: string | null = null;
}

/** 환불 수정 */
export class OrderRefundUpdateDto implements OrderRefundUpdateRequest {
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

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  readonly originOrderNo: string | null = null;
}

/** 반품 등록 */
export class OrderReturnCreateDto implements OrderReturnCreateRequest {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly srcCompanyId: number;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly dstCompanyId: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  readonly originOrderNo: string | null = null;

  @IsDateString()
  readonly orderDate: string;

  @IsDateString()
  readonly wantedDate: string;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly locationId: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 150)
  readonly memo: string | null = null;

  // 원지 스펙
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
  @Min(0)
  readonly grammage: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeX: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeY: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorGroupId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperPatternId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperCertId: number | null = null;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly quantity: number = 0;
}

/** 반품 수정 */
export class OrderReturnUpdateDto implements OrderReturnUpdateRequest {
  @IsDateString()
  readonly wantedDate: string;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly locationId: number;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  readonly memo: string = '';

  @IsDateString()
  readonly orderDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  readonly originOrderNo: string | null = null;
}

export class OrderReturnUpdateStockDto
  implements OrderReturnUpdateStockRequest
{
  // 원지 스펙
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
  @Min(0)
  readonly grammage: number;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeX: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeY: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorGroupId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperPatternId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperCertId: number | null = null;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly quantity: number = 0;
}

enum OrderGroupStatus {
  OFFER_REQUESTED = 'OFFER_REQUESTED',
  ACCEPTED = 'ACCEPTED',
}

export class OrderStockGroupItem {
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
  readonly locationId: number;

  @IsDateString()
  readonly wantedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 150)
  readonly memo: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsBoolean()
  readonly isDirectShipping: boolean | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly warehouseId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
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

  @ValidateIf((obj, val) => val !== null)
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly sizeY: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorGroupId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperColorId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperPatternId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly paperCertId: number | null = null;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly quantity: number;

  @ValidateIf((obj, val) => val !== null)
  @IsEnum(OrderGroupStatus)
  readonly orderStatus: 'OFFER_REQUESTED' | 'ACCEPTED' | null = null;
}

/** 일괄 등록 */
export class OrderStockGroupCreateDto implements OrderStockGroupCreateRequest {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => OrderStockGroupItem)
  readonly orders: OrderStockGroupItem[];

  /** returns isOffer */
  validate(companyId: number): boolean {
    const isOffer = companyId === this.orders[0].dstCompanyId;
    const locationId = this.orders[0].locationId;
    const orderDate = this.orders[0].orderDate;
    const wantedDate = this.orders[0].wantedDate;
    const isDirectShipping = this.orders[0].isDirectShipping;
    const orderStatus = this.orders[0].orderStatus;

    for (const order of this.orders) {
      if (isOffer && order.dstCompanyId !== companyId)
        throw new BadRequestException(`판매자 ID 에러`);
      if (!isOffer && order.srcCompanyId !== companyId)
        throw new BadRequestException(`구매자 ID 에러`);
      if (order.srcCompanyId === order.dstCompanyId)
        throw new BadRequestException(
          `자신의 회사에 거래를 등록할 수 없습니다.`,
        );

      if (locationId !== order.locationId)
        throw new BadRequestException(`배송지 ID 에러`);
      if (orderDate !== order.orderDate)
        throw new BadRequestException(`주문일 에러`);
      if (wantedDate !== order.wantedDate)
        throw new BadRequestException(`납기일시 에러`);
      if (isDirectShipping !== order.isDirectShipping)
        throw new BadRequestException(`직송여부 에러`);
      if (orderStatus !== order.orderStatus)
        throw new BadRequestException(`주문상태값 에러`);
    }

    return isOffer;
  }
}
