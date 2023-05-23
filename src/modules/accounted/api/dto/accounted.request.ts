import { AccountedType, Method, Subject } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { AccountedQuery } from "src/@shared/api";

export class AccountedRequest implements AccountedQuery {
  @Type(() => Number)
  @IsNumber()
  readonly skip: number;

  @Type(() => Number)
  @IsNumber()
  readonly take: number;

  @Type(() => Number)
  @IsNumber()
  readonly companyId: number;

  @IsString()
  readonly companyRegistrationNumber: string;

  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsEnum(Method)
  readonly accountedMethod: Method;

  @IsString()
  readonly accountedFromDate: string;

  @IsString()
  readonly accountedToDate: string;
}
