import { BadRequestException } from '@nestjs/common';
import {
  AccountedType,
  Bank,
  EndorsementType,
  Method,
  SecurityType,
  Subject,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  AccountedByBankAccountCreatedRequest,
  AccountedByCardCreatedRequest,
  AccountedByCashCreatedRequest,
  AccountedByEtcCreatedRequest,
  AccountedByOffsetCreatedRequest,
  AccountedBySecurityCreatedRequest,
  AccountedListQuery,
  AccountedUnpaidListQuery,
} from 'src/@shared/api';
import { IsName } from 'src/validator/is-name.validator';
import { IsOnlyNumber } from 'src/validator/is-only-number';

/** 수금/지급 목록 */
export class AccountedListDto implements AccountedListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = 30;

  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly companyRegistrationNumbers: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsDateString()
  readonly minAccountedDate: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsDateString()
  readonly maxAccountedDate: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly accountedSubjects: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly accountedMethods: string | null = null;
}

/** 수금/지급 등록 (계좌이체) */
export class AccountedByBankAccountCreatedDto
  implements AccountedByBankAccountCreatedRequest
{
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsDateString()
  readonly accountedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly memo: string | null = null;

  @IsInt()
  @Min(0)
  readonly amount: number;

  @IsInt()
  @IsPositive()
  readonly bankAccountId: number;
}

/** 수금/지급 등록 (유가증권) */
class Security {
  /**
   * 유가증권 타입
   */
  @IsEnum(SecurityType)
  readonly securityType: SecurityType;

  /**
   * 유가증권 번호
   */
  @IsString()
  @Length(1, 100)
  readonly securitySerial: string;

  /**
   * 유가증권 금액
   */
  @IsInt()
  @Min(0)
  readonly securityAmount: number;

  /**
   * 발행일
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsDateString()
  readonly drawedDate: string | null = null;

  /**
   * 발행 은행
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsEnum(Bank)
  readonly drawedBank: Bank | null = null;

  /**
   * 발행 은행 지점
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  @IsName()
  readonly drawedBankBranch: string | null = null;

  /**
   * 발행 지역
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  @IsName()
  readonly drawedRegion: string | null = null;

  /**
   * 발행인
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  @IsName()
  readonly drawer: string | null = null;

  /**
   * 만기일
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsDateString()
  readonly maturedDate: string | null = null;

  /**
   * 지급은행
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsEnum(Bank)
  readonly payingBank: Bank | null = null;

  /**
   * 지급은행 지점
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  @IsName()
  readonly payingBankBranch: string | null = null;

  /**
   * 지급인
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 100)
  @IsName()
  readonly payer: string | null = null;

  /**
   * 메모
   */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly memo: string | null = null;
}

export class AccountedBySecurityCreatedDto
  implements AccountedBySecurityCreatedRequest
{
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsDateString()
  readonly accountedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly memo: string | null = null;

  @IsInt()
  @Min(0)
  readonly amount: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsEnum(EndorsementType)
  readonly endorsementType: EndorsementType | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly endorsement: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly securityId: number | null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsObject()
  @Type(() => Security)
  @ValidateNested()
  readonly security: Security | null;

  validate() {
    if (this.accountedType === 'COLLECTED' && this.security === null) {
      throw new BadRequestException('유가증권 정보를 입력하셔야 합니다.');
    }
    if (this.accountedType === 'COLLECTED' && this.endorsementType === null) {
      throw new BadRequestException('배서구분을 선택하셔야 합니다.');
    }
    if (this.accountedType === 'PAID' && !this.securityId) {
      throw new BadRequestException('유가증권을 선택하셔야 합니다.');
    }
  }
}

/** 수금/지급 등록 (현금) */
export class AccountedByCashCreatedDto
  implements AccountedByCashCreatedRequest
{
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsDateString()
  readonly accountedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly memo: string | null = null;

  @IsInt()
  @Min(0)
  readonly amount: number;
}

/** 수금/지급 등록 (카드입금) */
export class AccountedByCardCreatedDto
  implements AccountedByCardCreatedRequest
{
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsDateString()
  readonly accountedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly memo: string | null = null;

  @IsInt()
  @Min(0)
  readonly cardAmount: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly vatPrice: number | null = null;

  @IsBoolean()
  readonly isCharge: boolean;

  @ValidateIf((obj, val) => val !== null)
  @IsString()
  @IsOnlyNumber()
  @Length(0, 150)
  readonly approvalNumber: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly cardId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly bankAccountId: number | null = null;

  validate() {
    if (this.accountedType === 'PAID' && !this.cardId) {
      throw new BadRequestException(`카드를 선택해 주세요.`);
    }
    if (this.accountedType === 'COLLECTED' && !this.bankAccountId) {
      throw new BadRequestException(`계좌를 선택해 주세요.`);
    }
  }
}

/** 수금/지급 등록 (상계) */
export class AccountedByOffsetCreatedDto
  implements AccountedByOffsetCreatedRequest
{
  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsDateString()
  readonly accountedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly memo: string | null = null;

  @IsInt()
  @Min(0)
  readonly amount: number;
}

/** 수금/지급 등록 (기타) */
export class AccountedByEtcCreatedDto implements AccountedByEtcCreatedRequest {
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsDateString()
  readonly accountedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly memo: string | null = null;

  @IsInt()
  @Min(0)
  readonly amount: number;
}

/** 미수금/미지급 목록 */
export class AccountedUnpaidListDto implements AccountedUnpaidListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = 30;

  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsOptional()
  @IsString()
  readonly companyRegistrationNumbers: string = '';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly minAmount: number | null = null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly maxAmount: number | null = null;

  /** 테스트용 */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly year: number | null = null;

  /** 테스트용 */
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(12)
  readonly month: number | null = null;
}
