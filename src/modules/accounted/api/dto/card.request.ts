import { AccountedType, Method, Subject } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  ByCardCreateRequest,
  ByCardUpdateRequest,
} from 'src/@shared/api/accounted/by-card.request';

export class ByCardCreateRequestDto implements ByCardCreateRequest {
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

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly cardId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly bankAccountId: number | null = null;

  @IsString()
  @IsOptional()
  readonly memo: string;

  @IsNumber()
  readonly amount: number;

  @IsNumber()
  @IsOptional()
  readonly totalAmount: number;

  @IsNumber()
  @IsOptional()
  readonly chargeAmount: number;

  @IsBoolean()
  @IsOptional()
  readonly isCharge: boolean;

  @IsString()
  @IsOptional()
  readonly approvalNumber: string;
}

export class ByCardUpdateRequestDto implements ByCardUpdateRequest {
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

  @IsNumber()
  @IsOptional()
  readonly totalAmount: number;

  @IsNumber()
  @IsOptional()
  readonly chargeAmount: number;

  @IsBoolean()
  @IsOptional()
  readonly isCharge: boolean;

  @IsString()
  @IsOptional()
  readonly approvalNumber: string;
}
