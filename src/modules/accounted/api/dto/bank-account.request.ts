import { AccountedType, Method, Subject } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  ByBankAccountCreateRequest,
  ByBankAccountUpdateRequest,
} from 'src/@shared/api/accounted/by-bank-account.request';
export class ByBankAccountCreateRequestDto
  implements ByBankAccountCreateRequest
{
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

export class ByBankAccountUpdateRequestDto
  implements ByBankAccountUpdateRequest
{
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
