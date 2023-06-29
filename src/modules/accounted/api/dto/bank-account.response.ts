import { AccountedType, Bank, Method, Subject } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ByBankAccountItemResponse } from 'src/@shared/api/accounted/by-bank-account.response';

export class ByBankAccountItemResponseDto implements ByBankAccountItemResponse {
  @IsNumber()
  readonly companyId: number;

  @IsString()
  readonly companyRegistrationNumber: string;

  @IsString()
  readonly partnerNickName: string;

  @IsNumber()
  readonly accountedId: number;

  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsEnum(Method)
  readonly accountedMethod: Method;

  @IsString()
  readonly accountedDate: string;

  @IsString()
  readonly memo: string;

  @IsNumber()
  readonly amount: number;

  @IsNumber()
  readonly bankAccountId: number;

  @IsString()
  readonly accountName: string;

  @IsString()
  readonly accountNumber: string;

  @IsEnum(Bank)
  readonly bankComapny: Bank;
}
