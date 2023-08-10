import { AccountType, Bank } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  BankAccountCreateRequest,
  BankAccountListQuery,
  BankAccountUpdateRequest,
} from 'src/@shared/api/inhouse/bank-account.request';
import { IsAccountNumber } from 'src/validator/is-account-number';
import { IsName } from 'src/validator/is-name.validator';

export class BankAccountListDto implements BankAccountListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @ValidateIf((obj, val) => val !== undefined)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = undefined;
}

export class BankAccountCreateRequestDto implements BankAccountCreateRequest {
  @IsEnum(Bank)
  readonly bank: Bank;

  @IsString()
  @IsName()
  @Length(1, 100)
  readonly accountName: string;

  @IsEnum(AccountType)
  readonly accountType: AccountType;

  @IsString()
  @IsAccountNumber()
  @Length(1, 20)
  readonly accountNumber: string;

  @IsString()
  @IsName()
  @Length(1, 100)
  readonly accountHolder: string;
}

export class BankAccountUpdateRequestDto implements BankAccountUpdateRequest {
  @IsString()
  readonly accountName: string;
}
