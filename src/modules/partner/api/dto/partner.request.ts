import { IsNumber, IsString } from 'class-validator';
import { PartnerResponse } from 'src/@shared/api';

export class PartnerResponseDto implements PartnerResponse {
  @IsNumber()
  partnerId: number;

  @IsNumber()
  companyId: number;

  @IsString()
  companyRegistrationNumber: string;

  @IsString()
  partnerNickName: string;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsString()
  memo: string = '';
}
