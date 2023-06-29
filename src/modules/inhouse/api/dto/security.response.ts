import {
  Bank,
  DrawedStatus,
  SecurityStatus,
  SecurityType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import {
  SecurityItemResponse,
  SecurityListResponse,
} from 'src/@shared/api/inhouse/security.response';
import { Security } from 'src/@shared/models';

export class SecurityListResponseDto implements SecurityListResponse {
  @IsArray()
  readonly items: Security[];

  @IsNumber()
  readonly total: number;
}

export class SecurityItemResponseDto implements SecurityItemResponse {
  @Type(() => Number)
  @IsNumber()
  readonly securityId: number;

  @IsEnum(SecurityType)
  readonly securityType: SecurityType;

  @IsString()
  readonly securitySerial: string;

  @IsNumber()
  readonly securityAmount: number;

  @IsEnum(SecurityStatus)
  readonly securityStatus: SecurityStatus;

  @IsEnum(DrawedStatus)
  readonly drawedStatus: DrawedStatus;

  @IsString()
  readonly drawedDate: string;

  @IsEnum(Bank)
  readonly drawedBank: Bank;

  @IsString()
  readonly drawedBankBranch: string;

  @IsString()
  readonly drawedRegion: string;

  @IsString()
  readonly drawer: string;

  @IsString()
  readonly maturedDate: string;

  @IsEnum(Bank)
  readonly payingBank: Bank;

  @IsString()
  readonly payingBankBranch: string;

  @IsString()
  readonly payer: string;

  @IsString()
  readonly memo: string;
}
