import { Bank, SecurityStatus, SecurityType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  SecurityCreateRequest,
  SecurityListQuery,
  SecurityStatusUpdateRequest,
} from 'src/@shared/api/inhouse/security.request';
import { IsName } from 'src/validator/is-name.validator';

/** 유가증권 목록 */
export class SecurityListDto implements SecurityListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @ValidateIf((obj, val) => val !== undefined)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = undefined;
}

/** 유가증권 등록 */
export class SecurityCreateRequestDto implements SecurityCreateRequest {
  @IsEnum(SecurityType)
  readonly securityType: SecurityType;

  @IsString()
  @Length(1, 150)
  readonly securitySerial: string;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly securityAmount: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsDateString()
  readonly drawedDate: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsEnum(Bank)
  readonly drawedBank: Bank | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @IsName()
  @Length(0, 150)
  readonly drawedBankBranch: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @IsName()
  @Length(0, 150)
  readonly drawedRegion: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @IsName()
  @Length(0, 150)
  readonly drawer: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsDateString()
  readonly maturedDate: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsEnum(Bank)
  readonly payingBank: Bank | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @IsName()
  @Length(0, 150)
  readonly payingBankBranch: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @IsName()
  @Length(0, 150)
  readonly payer: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 150)
  readonly memo: string | null = null;
}

export class SecurityStatusUpdateDto implements SecurityStatusUpdateRequest {
  @IsEnum(SecurityStatus)
  readonly securityStatus: SecurityStatus;
}
