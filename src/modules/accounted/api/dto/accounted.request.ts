import { AccountedType, Method, Subject } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AccountedQuery, AccountedUnpaidListQuery } from 'src/@shared/api';

type AccountedRequestDto = Omit<AccountedQuery, 'partnerNickName'>;

export class AccountedRequest implements AccountedRequestDto {
  @Type(() => Number)
  @IsNumber()
  readonly skip: number;

  @Type(() => Number)
  @IsNumber()
  readonly take: number;

  @Type(() => Number)
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
  readonly accountedFromDate: string;

  @IsString()
  readonly accountedToDate: string;
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
}
