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
  id: string;
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
