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
  Min,
  ValidateIf,
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

  @ValidateIf((obj, val) => val !== '')
  @IsOptional()
  @IsString()
  @IsEmail()
  @Length(0, 100)
  readonly dstEmail: string = '';

  @ValidateIf((obj, val) => val !== '')
  @IsOptional()
  @IsString()
  @IsEmail()
  @Length(0, 100)
  readonly srcEmail: string = '';

  @ValidateIf((obj) => obj.srcEmail)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  readonly srcEmailName: string = '';

  @ValidateIf((obj, val) => val !== '')
  @IsOptional()
  @IsString()
  @IsEmail()
  @Length(0, 100)
  readonly srcEmail2: string = '';

  @ValidateIf((obj) => obj.srcEmail2)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  readonly srcEmailName2: string = '';

  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly memo: string = '';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly cash: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly check: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly note: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly credit: number | null = null;
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
