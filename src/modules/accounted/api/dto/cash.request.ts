import { AccountedType, Method, Subject } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ByCashCreateRequest } from "src/@shared/api";

export class CashRequest implements ByCashCreateRequest {

  @Type(() => Number)
  @IsNumber()
  readonly partnerId: number;

  @IsString()
  readonly partnerNickName: string;

  @IsNumber()
  @IsOptional()
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

  @Type(() => Number)
  @IsNumber()
  readonly amount: number;
}
