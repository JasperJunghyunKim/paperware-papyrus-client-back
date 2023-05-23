import { CardCompany } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { CardCreateRequest, CardUpdateRequest } from "src/@shared/api/inhouse/card.request";

export class CardCreateRequestDto implements CardCreateRequest {
  @IsNumber()
  cardId: number;

  @IsString()
  cardName: string;

  @IsEnum(CardCompany)
  cardCompany: CardCompany;

  @IsString()
  cardNumber: string;

  @IsString()
  cardHolder: string;
}

export class CardUpdateRequestDto implements CardUpdateRequest {
  @IsString()
  cardName: string;
}
