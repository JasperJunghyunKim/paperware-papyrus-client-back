import { AccountedType, EndorsementType, Method, Subject } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { BySecurityCreateRequest, BySecurityUpdateRequest } from "src/@shared/api/accounted/by-security.request";
import { Security } from "src/@shared/models";

export class BySecurityCreateRequestDto implements BySecurityCreateRequest {
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
  readonly accountedDate: string;

  @IsString()
  @IsOptional()
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

export class BySecurityUpdateRequestDto implements BySecurityUpdateRequest {

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

  @IsEnum(EndorsementType)
  readonly endorsementType: EndorsementType;

  @IsString()
  readonly endorsement: string;

  @IsNumber()
  @IsOptional()
  readonly bySecurityId?: number;

  @IsOptional()
  readonly security: Security;
}
