import { Method, Subject } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { PaidByEtcCreateRequest } from "src/@shared/api";

export class PaidEtcRequest implements PaidByEtcCreateRequest {
  @Type(() => Number)
  @IsNumber()
  readonly partnerId: number;

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
