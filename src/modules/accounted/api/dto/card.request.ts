import { AccountedType, Method, Subject } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
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

  @IsNumber()
  readonly cardId: number;

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
