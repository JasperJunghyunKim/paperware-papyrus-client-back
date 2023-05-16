import { AccountType, Bank } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { BankAccountResponse } from "src/@shared/api/back-account/bank-account.response";

export class BankAccountResponseDto implements BankAccountResponse {
  @IsNumber()
  accountId: number;

  @IsEnum(Bank)
  bankComapny: Bank;

  @IsString()
  accountName: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsString()
  accountNumber: string;

  @IsString()
  accountHolder: string;
}
