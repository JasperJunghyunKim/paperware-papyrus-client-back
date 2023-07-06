import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
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

export class UpdateTaxInvoiceRequestDto implements UpdateTaxInvoiceRequest {}
