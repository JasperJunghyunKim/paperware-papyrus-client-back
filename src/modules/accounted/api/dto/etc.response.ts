import { Method, Subject } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { PaidByEtcItemResponse } from "src/@shared/api";

export class PaidEtcResponse implements PaidByEtcItemResponse {

  @Type(() => Number)
  @IsNumber()
  readonly partnerId: number;

  @IsString()
  readonly partnerNickName: string;

  @Type(() => Number)
  @IsNumber()
  readonly accountedId: number;

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
}
