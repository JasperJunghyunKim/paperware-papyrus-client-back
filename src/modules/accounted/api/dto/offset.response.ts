import { AccountedType, Method, Subject } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { ByOffsetItemResponse } from "src/@shared/api/accounted/by-offset.response";

export class ByOffsetItemResponseDto implements ByOffsetItemResponse {
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
}
