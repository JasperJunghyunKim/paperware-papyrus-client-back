import { AccountType, Bank } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import {
  BankAccountItemResponse,
  BankAccountListResponse,
} from 'src/@shared/api/inhouse/bank-account.response';
import { BankAccount } from 'src/@shared/models';

export class BankAccountListResponseDto implements BankAccountListResponse {
  @IsArray()
  readonly items: BankAccount[];

  @IsNumber()
  readonly total: number;
}

export class BankAccountItemResponseDto implements BankAccountItemResponse {
  @IsNumber()
  readonly accountId: number;

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
