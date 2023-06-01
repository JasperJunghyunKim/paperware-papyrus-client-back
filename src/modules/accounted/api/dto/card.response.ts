import { AccountedType, CardCompany, Method, Subject } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ByCardItemResponse } from "src/@shared/api/accounted/by-card.response";

export class ByCardResponseDto implements ByCardItemResponse {
  @IsNumber()
  readonly companyId: number;

  @IsString()
  readonly companyRegistrationNumber: string;

  @IsString()
  readonly partnerNickName: string;

  @IsNumber()
  readonly accountedId: number;

  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsEnum(Method)
  readonly accountedMethod: Method;

  @IsString()
  readonly accountedDate: string;

  @IsString()
  readonly memo: string;

  @IsNumber()
  readonly amount: number;

  @IsNumber()
  readonly totalAmount: number;

  @IsNumber()
  @IsOptional()
  readonly cardId: number;

  @IsString()
  @IsOptional()
  readonly cardName: string;

  @IsNumber()
  @IsOptional()
  readonly bankAccountId: number;

  @IsString()
  @IsOptional()
  readonly accountName: string;

  @IsString()
  @IsOptional()
  readonly cardNumber: string;

  @IsEnum(CardCompany)
  @IsOptional()
  readonly cardCompany: CardCompany;

  @IsNumber()
  readonly chargeAmount: number;

  @IsBoolean()
  readonly isCharge: boolean;

  @IsString()
  readonly approvalNumber: string;
}
