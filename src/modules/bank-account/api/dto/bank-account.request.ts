import { AccountType, Bank } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { BankAccountCreateRequest, BankAccountUpdateRequest } from "src/@shared/api/back-account/bank-account.request";

export class BankAccountCreateRequestDto implements BankAccountCreateRequest {
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

export class BankAccountUpdateRequestDto implements BankAccountUpdateRequest {
  @IsString()
  accountName: string;
}
