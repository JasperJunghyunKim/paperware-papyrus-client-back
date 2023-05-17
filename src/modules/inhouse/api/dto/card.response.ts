import { CardCompany } from "@prisma/client";
import { IsArray, IsEnum, IsNumber, IsString } from "class-validator";
import { CardItemResponse, CardListResponse } from "src/@shared/api/card/card.response";
import { Card } from "src/@shared/models";

export class CardListResponseDto implements CardListResponse {
  @IsArray()
  items: Card[];

  @IsNumber()
  total: number;
}

export class CardItemResponseDto implements CardItemResponse {
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
