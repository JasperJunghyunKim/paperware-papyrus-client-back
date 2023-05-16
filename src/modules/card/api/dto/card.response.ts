import { CardCompany } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { CardResponse } from "src/@shared/api/card/card.response";

export class CardResponseDto implements CardResponse {
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
