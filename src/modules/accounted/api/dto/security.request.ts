import { BadRequestException } from '@nestjs/common';
import {
  AccountedType,
  Bank,
  DrawedStatus,
  EndorsementType,
  Method,
  SecurityStatus,
  SecurityType,
  Subject,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  BySecurityCreateRequest,
  BySecurityUpdateRequest,
} from 'src/@shared/api/accounted/by-security.request';
import { IsName } from 'src/validator/is-name.validator';

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

export class BySecurityCreateRequestDto implements BySecurityCreateRequest {
  @IsString()
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

  validate(type: AccountedType) {
    if (type === 'COLLECTED' && this.security === null) {
      throw new BadRequestException('유가증권 정보를 입력하셔야 합니다.');
    }
    if (type === 'COLLECTED' && this.endorsementType === null) {
      throw new BadRequestException('배서구분을 선택하셔야 합니다.');
    }
    if (type === 'PAID' && !this.securityId) {
      throw new BadRequestException('유가증권을 선택하셔야 합니다.');
    }
  }
}

export class BySecurityUpdateRequestDto implements BySecurityUpdateRequest {
  @IsEnum(AccountedType)
  readonly accountedType: AccountedType;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsEnum(Method)
  readonly accountedMethod: Method;

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

  validate(type: AccountedType) {
    if (type === 'COLLECTED' && this.endorsementType === null) {
      throw new BadRequestException('배서구분을 선택하셔야 합니다.');
    }
  }
}
