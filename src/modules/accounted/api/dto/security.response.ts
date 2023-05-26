import { AccountedType, EndorsementType, Method, Subject } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { BySecurityItemResponse } from "src/@shared/api/accounted/by-security.response";
import { Security } from "src/@shared/models";

export class BySecurityResponseDto implements BySecurityItemResponse {
  @IsNumber()
  readonly companyId: number;

  @IsString()
  readonly companyRegistrationNumber: string;

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

  @IsEnum(EndorsementType)
  readonly endorsementType: EndorsementType;

  @IsString()
  readonly endorsement: string;

  @IsOptional()
  readonly security: Security;
}
