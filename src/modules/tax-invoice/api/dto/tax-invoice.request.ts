import { TaxInvoicePurposeType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import {
  AddOrderToTaxInvoiceRequest,
  CreateTaxInvoiceRequest,
  DeleteOrderFromTaxInvoiceRequest,
  GetTaxInvoiceListQuery,
  UpdateTaxInvoiceRequest,
} from 'src/@shared/api';

export class GetTaxInvoiceListQueryDto implements GetTaxInvoiceListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip = 0;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take: number = undefined;
}

export class CreateTaxInvoiceRequestDto implements CreateTaxInvoiceRequest {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly companyId: number;

  @IsEnum(TaxInvoicePurposeType)
  readonly purposeType: TaxInvoicePurposeType;

  @IsDateString()
  readonly writeDate: string;
}

export class UpdateTaxInvoiceRequestDto implements UpdateTaxInvoiceRequest {
  @IsEnum(TaxInvoicePurposeType)
  readonly purposeType: TaxInvoicePurposeType;

  @IsDateString()
  readonly writeDate: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @Length(0, 100)
  readonly dstEmail: string = '';

  @IsOptional()
  @IsString()
  @IsEmail()
  @Length(0, 100)
  readonly srcEmail: string = '';

  @IsOptional()
  @IsString()
  @IsEmail()
  @Length(0, 100)
  readonly srcEmail2: string = '';

  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly memo: string = '';
}

/** 매출 추가 */
export class AddOrderToTaxInvoiceDto implements AddOrderToTaxInvoiceRequest {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  readonly orderIds: number[];
}

/** 매출 삭제 */
export class DeleteOrderFromTaxInvoiceDto
  implements DeleteOrderFromTaxInvoiceRequest
{
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  readonly orderIds: number[];
}
