import { AccountType, Bank } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';
import {
  BankAccountCreateRequest,
  BankAccountUpdateRequest,
} from 'src/@shared/api/inhouse/bank-account.request';

export class BankAccountCreateRequestDto implements BankAccountCreateRequest {
  @IsEnum(Bank)
  readonly bankComapny: Bank;

  @IsString()
  readonly accountName: string;

  @IsEnum(AccountType)
  readonly accountType: AccountType;

  @IsString()
  readonly accountNumber: string;

  @IsString()
  readonly accountHolder: string;
}

export class BankAccountUpdateRequestDto implements BankAccountUpdateRequest {
  @IsString()
  readonly accountName: string;
}
