import { AccountedType, Method, Subject } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ByEtcCreateRequest, ByEtcUpdateRequest } from "src/@shared/api";

export class ByEtcCreateRequestDto implements ByEtcCreateRequest {
  @IsNumber()
  readonly partnerId: number;

  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsEnum(Method)
  readonly accountedMethod: Method;

  @IsString()
  readonly accountedDate: string;

  @IsString()
  @IsOptional()
  readonly memo: string;

  @IsNumber()
  readonly amount: number;
}

export class ByEtcUpdateRequestDto implements ByEtcUpdateRequest {
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsEnum(Method)
  readonly accountedMethod: Method;

  @IsString()
  readonly accountedDate: string;

  @IsString()
  @IsOptional()
  readonly memo: string;

  @IsNumber()
  readonly amount: number;
}
