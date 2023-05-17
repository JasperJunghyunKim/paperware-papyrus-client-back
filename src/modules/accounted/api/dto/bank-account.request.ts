import { AccountedType, Method, Subject } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { ByBankAccountCreateRequest, ByBankAccountUpdateRequest } from "src/@shared/api/accounted/by-bank-account.request";
export class ByBankAccountCreateRequestDto implements ByBankAccountCreateRequest {
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
  readonly bankAccountId: number;
}

export class ByBankAccountUpdateRequestDto implements ByBankAccountUpdateRequest {
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
  readonly bankAccountId: number;
}
