import {
  AccountedType,
  Bank,
  CardCompany,
  Method,
  Subject,
} from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { ByCardItemResponse } from 'src/@shared/api/accounted/by-card.response';

export class ByCardResponseDto implements ByCardItemResponse {
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
  readonly totalAmount: number;

  @IsNumber()
  readonly cardId: number | null;

  @IsString()
  readonly cardName: string | null;

  @IsString()
  readonly cardNumber: string | null;

  @IsEnum(CardCompany)
  readonly cardCompany: CardCompany | null;

  @IsNumber()
  readonly bankAccountId: number | null;

  @IsString()
  readonly accountName: string | null;

  @IsString()
  readonly bankAccountNumber: string | null;

  @IsEnum(Bank)
  readonly bankComapny: Bank | null;

  @IsNumber()
  readonly chargeAmount: number;

  @IsBoolean()
  readonly isCharge: boolean;

  @IsString()
  readonly approvalNumber: string;
}
