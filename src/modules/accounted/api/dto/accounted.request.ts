import { AccountedType, Method, Subject } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  AccountedByBankAccountCreatedRequest,
  AccountedByCashCreatedRequest,
  AccountedUnpaidListQuery,
} from 'src/@shared/api';

export class AccountedTypeDto {
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;
}

export class AccountedUnpaidListDto implements AccountedUnpaidListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = 30;

  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsOptional()
  @IsString()
  readonly companyRegistrationNumbers: string = '';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly minAmount: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly maxAmount: number | null = null;

  /** 테스트용 */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly year: number | null = null;

  /** 테스트용 */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(12)
  readonly month: number | null = null;
}

/** 수금/지급 등록 (계좌이체) */
export class AccountedByBankAccountCreatedDto
  implements AccountedByBankAccountCreatedRequest
{
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsDateString()
  readonly accountedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly memo: string | null = null;

  @IsInt()
  @Min(0)
  readonly amount: number;

  @IsInt()
  @IsPositive()
  readonly bankAccountId: number;
}

/** 수금/지급 등록 (현금) */
export class AccountedByCashCreatedDto
  implements AccountedByCashCreatedRequest
{
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsDateString()
  readonly accountedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly memo: string | null = null;

  @IsInt()
  @Min(0)
  readonly amount: number;
}
