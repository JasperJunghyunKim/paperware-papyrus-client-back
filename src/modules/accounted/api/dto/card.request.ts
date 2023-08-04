import { AccountedType, Method, Subject } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  ByCardCreateRequest,
  ByCardUpdateRequest,
} from 'src/@shared/api/accounted/by-card.request';

export class ByCardCreateRequestDto implements ByCardCreateRequest {
  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string;

  @IsEnum(Subject)
  readonly accountedSubject: Subject;

  @IsDateString()
  readonly accountedDate: string;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly cardId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly bankAccountId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly memo: string | null = null;

  @IsInt()
  @Min(0)
  readonly amount: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly chargeAmount: number | null = null;

  @IsBoolean()
  @IsOptional()
  readonly isCharge: boolean;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly approvalNumber: string | null = null;
}

export class ByCardUpdateRequestDto implements ByCardUpdateRequest {
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
  @IsInt()
  @Min(0)
  readonly chargeAmount: number | null = null;

  @IsBoolean()
  @IsOptional()
  readonly isCharge: boolean;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly approvalNumber: string | null = null;
}
