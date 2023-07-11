import { BadRequestException, Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  BusinessRelationshipCompactListQuery,
  BusinessRelationshipCreateRequest,
  BusinessRelationshipListQuery,
  BusinessRelationshipRequestRequest,
  RegisterPartnerRequest,
  SearchPartnerRequest,
  UpsertPartnerRequest,
} from 'src/@shared/api';
import { IsOnlyNumber } from 'src/validator/is-only-number';

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

class PartnerTaxManagerDto {
  @IsString()
  @Length(1, 20)
  readonly name: string;

  @IsString()
  @IsOnlyNumber()
  @Length(1, 20)
  readonly phoneNo: string;

  @IsString()
  @IsEmail()
  @Length(1, 20)
  readonly email: string;

  @IsBoolean()
  readonly isDefault: boolean;
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
  @IsOptional()
  @IsString()
  businessName = '';
  @Optional()
  @IsString()
  invoiceCode = '';
  @IsOptional()
  @IsString()
  bizType = '';
  @IsOptional()
  @IsString()
  bizItem = '';
  @IsNumber()
  creditLimit: number = 0;
  @IsString()
  address: string;
  @IsOptional()
  @IsString()
  phoneNo = '';
  @IsOptional()
  @IsString()
  faxNo = '';
  @IsOptional()
  @IsString()
  representative = '';
  @IsOptional()
  @IsString()
  memo = '';
  @IsArray()
  @ArrayMaxSize(4)
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => PartnerTaxManagerDto)
  readonly partnerTaxManager: PartnerTaxManagerDto[] = [];

  validate() {
    const defaultManagers = this.partnerTaxManager.filter(
      (manager) => manager.isDefault,
    );
    if (defaultManagers.length > 1) {
      throw new BadRequestException(
        `대표세금계산서 담당자는 한명만 지정 가능합니다.`,
      );
    }
  }
}

export class BusinessRelationshipReqeustRequestDto
  implements BusinessRelationshipRequestRequest
{
  @IsNumber()
  targetCompanyId: number;
  @IsString()
  type: 'PURCHASE' | 'SALES' | 'BOTH' | 'NONE';
}

export class UpsertPartnerRequestDto implements UpsertPartnerRequest {
  @IsString()
  companyRegistrationNumber: string;
  @IsString()
  partnerNickname: string;
  @IsNumber()
  creditLimit: number = 0;
  @IsString()
  memo = '';
}
