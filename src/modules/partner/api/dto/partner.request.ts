import { IsNumber, IsString } from 'class-validator';
import { PartnerResponse } from 'src/@shared/api';

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
