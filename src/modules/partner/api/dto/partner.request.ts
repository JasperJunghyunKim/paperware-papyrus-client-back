import { IsNumber, IsString } from "class-validator";
import { PartnerResponse } from "src/@shared/api";

export class PartnerResponseDto implements PartnerResponse {
  @IsNumber()
  partnerId: number;

  @IsString()
  partnerNickName: string;
}
