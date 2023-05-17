import { AccountedType, Method, Subject } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ByCashCreateRequest, ByCashUpdateRequest } from "src/@shared/api";

export class ByCashCreateRequestDto implements ByCashCreateRequest {
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

  @Type(() => Number)
  readonly amount: number;
}

export class ByCashUpdateRequestDto implements ByCashUpdateRequest {
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
  readonly amount: number;
}
