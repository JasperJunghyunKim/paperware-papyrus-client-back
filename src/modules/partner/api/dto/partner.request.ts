import { IsNumber, IsString } from 'class-validator';
import { PartnerResponse } from 'src/@shared/api';

export class PartnerResponseDto implements PartnerResponse {
  @IsNumber()
  companyId: number;

  @IsString()
  companyRegistrationNumber: string;

  @IsString()
  partnerNickName: string;

  @IsString()
  memo: string = '';
}
