import { AccountType, Bank } from "@prisma/client";
import { IsArray, IsEnum, IsNumber, IsString } from "class-validator";
import { BankAccountItemResponse, BankAccountListResponse } from "src/@shared/api/back-account/bank-account.response";
import { BankAccount } from "src/@shared/models";

export class BankAccountListResponseDto implements BankAccountListResponse {
  @IsArray()
  items: BankAccount[];

  @IsNumber()
  total: number;
}


export class BankAccountItemResponseDto implements BankAccountItemResponse {
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
