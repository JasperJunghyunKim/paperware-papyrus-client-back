import {
  Bank,
  DrawedStatus,
  SecurityStatus,
  SecurityType,
} from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  SecurityCreateRequest,
  SecurityUpdateRequest,
  SecurityUpdateStatusRequest,
} from 'src/@shared/api/inhouse/security.request';

export class SecurityCreateRequestDto implements SecurityCreateRequest {
  @IsEnum(SecurityType)
  readonly securityType: SecurityType;

  @IsString()
  readonly securitySerial: string;

  @IsNumber()
  readonly securityAmount: number;

  @IsString()
  @IsOptional()
  readonly drawedDate: string;

  @IsEnum(Bank)
  @IsOptional()
  readonly drawedBank: Bank;

  @IsString()
  @IsOptional()
  readonly drawedBankBranch: string;

  @IsString()
  @IsOptional()
  readonly drawedRegion: string;

  @IsString()
  @IsOptional()
  readonly drawer: string;

  @IsString()
  @IsOptional()
  readonly maturedDate: string;

  @IsEnum(Bank)
  @IsOptional()
  readonly payingBank: Bank;

  @IsString()
  @IsOptional()
  readonly payingBankBranch: string;

  @IsString()
  @IsOptional()
  readonly payer: string;

  @IsString()
  @IsOptional()
  readonly memo: string;
}

export class SecurityUpdateRequestDto implements SecurityUpdateRequest {
  @IsEnum(SecurityType)
  readonly securityType: SecurityType;

  @IsString()
  readonly securitySerial: string;

  @IsNumber()
  readonly securityAmount: number;

  @IsEnum(SecurityStatus)
  @IsOptional()
  readonly securityStatus: SecurityStatus;

  @IsEnum(DrawedStatus)
  @IsOptional()
  readonly drawedStatus: DrawedStatus;

  @IsString()
  @IsOptional()
  readonly drawedDate: string;

  @IsEnum(Bank)
  @IsOptional()
  readonly drawedBank: Bank;

  @IsString()
  @IsOptional()
  readonly drawedBankBranch: string;

  @IsString()
  @IsOptional()
  readonly drawedRegion: string;

  @IsString()
  @IsOptional()
  readonly drawer: string;

  @IsString()
  @IsOptional()
  readonly maturedDate: string;

  @IsEnum(Bank)
  @IsOptional()
  readonly payingBank: Bank;

  @IsString()
  @IsOptional()
  readonly payingBankBranch: string;

  @IsString()
  @IsOptional()
  readonly payer: string;

  @IsString()
  @IsOptional()
  readonly memo: string;
}

export class SecurityUpdateStatusRequestDto
  implements SecurityUpdateStatusRequest
{
  @IsEnum(SecurityStatus)
  readonly securityStatus: SecurityStatus;

  @IsString()
  @IsOptional()
  readonly memo: string;
}
