import { AccountType, Bank } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";
import { BankAccountCreateRequest, BankAccountUpdateRequest } from "src/@shared/api/inhouse/bank-account.request";

export class BankAccountCreateRequestDto implements BankAccountCreateRequest {
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
