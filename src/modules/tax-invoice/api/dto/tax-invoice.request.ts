import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import {
  CreateTaxInvoiceRequest,
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
  @IsString()
  companyRegistrationNumber: string;

  @IsDateString()
  writeDate: string;
}

export class UpdateTaxInvoiceRequestDto implements UpdateTaxInvoiceRequest {
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
