import { Method, Subject } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { PaidQuery } from "src/@shared/api";

export class PaidRequest implements PaidQuery {
  @IsNumber()
  readonly partnerId: number;

  @IsString()
  readonly partnerNickName: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsEnum(Method)
  readonly accountedMethod: Method;

  @IsString()
  readonly accountedFromDate: string;

  @IsString()
  readonly accountedToDate: string;
}
