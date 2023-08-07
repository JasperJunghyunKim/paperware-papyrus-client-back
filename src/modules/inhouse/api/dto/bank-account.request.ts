import { AccountType, Bank } from '@prisma/client';
import { IsEnum, IsString, Length } from 'class-validator';
import {
  BankAccountCreateRequest,
  BankAccountUpdateRequest,
} from 'src/@shared/api/inhouse/bank-account.request';
import { IsAccountNumber } from 'src/validator/is-account-number';
import { IsName } from 'src/validator/is-name.validator';

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
  @Length(1, 150)
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
