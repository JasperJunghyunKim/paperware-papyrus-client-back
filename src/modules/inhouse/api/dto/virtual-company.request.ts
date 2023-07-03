import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  VirtualCompanyCreateRequest,
  VirtualCompanyListQuery,
  VirtualCompanyUpdateRequest,
} from 'src/@shared/api/inhouse/virtual-company.request';

export class VirtualCompanyListQueryDto implements VirtualCompanyListQuery {
  @IsInt()
  @Type(() => Number)
  skip: number;
  @IsInt()
  @Type(() => Number)
  take: number;
}

export class VirtualCompanyCreateRequestDto
  implements VirtualCompanyCreateRequest
{
  @IsString()
  @MaxLength(30)
  companyRegistrationNumber: string;
  @IsString()
  @MaxLength(6)
  invoiceCode: string;
  @IsString()
  @MaxLength(30)
  representative: string;
  @IsString()
  @MaxLength(500)
  address: string;
  @IsString()
  @MaxLength(30)
  businessName: string;
  @IsString()
  @MaxLength(30)
  phoneNo: string;
  @IsString()
  @MaxLength(30)
  faxNo: string;
  @IsString()
  @MaxLength(100)
  email: string;
}

export class VirtualCompanyUpdateRequestDto
  implements VirtualCompanyUpdateRequest
{
  @IsString()
  @MaxLength(30)
  companyRegistrationNumber: string;
  @IsString()
  @MaxLength(6)
  invoiceCode: string;
  @IsString()
  @MaxLength(30)
  representative: string;
  @IsString()
  @MaxLength(500)
  address: string;
  @IsString()
  @MaxLength(30)
  businessName: string;
  @IsString()
  @MaxLength(30)
  phoneNo: string;
  @IsString()
  @MaxLength(30)
  faxNo: string;
  @IsString()
  @MaxLength(100)
  email: string;
}
