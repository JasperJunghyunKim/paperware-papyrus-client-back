import { Method, Subject } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { PaidQuery } from "src/@shared/api";

export class PaidRequest implements PaidQuery {
  @Type(() => Number)
  @IsNumber()
  readonly skip: number;

  @Type(() => Number)
  @IsNumber()
  readonly take: number;

  @Type(() => Number)
  @IsNumber()
  readonly partnerId: number;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsEnum(Method)
  readonly accountedMethod: Method;

  @IsString()
  readonly accountedFromDate: string;

  @IsString()
  readonly accountedToDate: string;
}
