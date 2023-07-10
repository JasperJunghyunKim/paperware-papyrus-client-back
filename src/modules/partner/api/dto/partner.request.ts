import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import {
  PartnerResponse,
  PartnerTaxManagerCreateRequest,
  PartnerTaxManagerUpdateRequest,
} from 'src/@shared/api';
import { IsOnlyNumber } from 'src/validator/is-only-number';

interface PartnerTaxManager {
  id: number;
  name: string;
  phoneNo: string;
  email: string;
  isDefault: boolean;
}

export class PartnerResponseDto implements PartnerResponse {
  @IsNumber()
  readonly companyId: number;

  @IsString()
  readonly companyRegistrationNumber: string;

  @IsString()
  readonly partnerNickName: string;

  @IsNumber()
  readonly creditLimit: number;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsString()
  readonly memo: string = '';

  readonly partnerTaxManager: PartnerTaxManager[];
}

export class PartnerTaxManagerListDto {
  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;
}

export class PartnerTaxManagerCreateDto
  implements PartnerTaxManagerCreateRequest
{
  @IsString()
  @IsOnlyNumber()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsString()
  @Length(1, 20)
  readonly name: string;

  @IsString()
  @IsOnlyNumber()
  @Length(8, 11)
  readonly phoneNo: string;

  @IsString()
  @IsEmail()
  @Length(1, 100)
  readonly email: string;

  @IsBoolean()
  readonly isDefault: boolean;
}

export class PartnerTaxManagerUpdateDto
  implements PartnerTaxManagerUpdateRequest
{
  @IsString()
  @Length(1, 20)
  readonly name: string;

  @IsString()
  @IsOnlyNumber()
  @Length(8, 11)
  readonly phoneNo: string;

  @IsString()
  @IsEmail()
  @Length(1, 100)
  readonly email: string;

  @IsBoolean()
  readonly isDefault: boolean;
}
