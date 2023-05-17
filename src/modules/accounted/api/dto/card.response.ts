import { AccountedType, Method, Subject } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";
import { ByCardItemResponse } from "src/@shared/api/accounted/by-card.response";

export class ByCardResponseDto implements ByCardItemResponse {
  @IsNumber()
  readonly partnerId: number;

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
  readonly cardId: number;

  @IsNumber()
  readonly chargeAmount: number;

  @IsBoolean()
  readonly isCharge: boolean;

  @IsString()
  readonly approvalNumber: string;
}
