import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  BusinessRelationshipCompactListQuery,
  BusinessRelationshipCreateRequest,
  BusinessRelationshipListQuery,
  RegisterPartnerRequest,
  SearchPartnerRequest,
} from 'src/@shared/api';

export class BusinessRelationshipListQueryDto
  implements BusinessRelationshipListQuery
{
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
  readonly take: number = undefined;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  srcCompanyId: number;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  dstCompanyId: number;
}

export class BusinessRelationshipCreateRequestDto
  implements BusinessRelationshipCreateRequest
{
  @IsInt()
  srcCompanyId: number;
  @IsInt()
  dstCompanyId: number;
}

export class BusinessRelationshipCompactListQueryDto
  implements BusinessRelationshipCompactListQuery
{
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
  readonly take: number = undefined;
}

export class SearchPartnerRequestDto implements SearchPartnerRequest {
  @IsString()
  companyRegistrationNumber: string;
}

export class RegisterPartnerRequestDto implements RegisterPartnerRequest {
  @IsString()
  companyRegistrationNumber: string;
  @IsBoolean()
  create: boolean;
  @IsString()
  type: 'PURCHASE' | 'SALES' | 'BOTH';
  @IsString()
  partnerNickname: string;
  @Optional()
  @IsString()
  invoiceCode: string = '';
  @IsString()
  address: string;
  @IsOptional()
  @IsString()
  phoneNo: string = '';
  @IsOptional()
  @IsString()
  faxNo: string = '';
  @IsOptional()
  @IsString()
  email: string = '';
  @IsOptional()
  @IsString()
  memo: string = '';
}
