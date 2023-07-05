import { IsNumber, IsString } from 'class-validator';
import { PartnerResponse } from 'src/@shared/api';

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
}
