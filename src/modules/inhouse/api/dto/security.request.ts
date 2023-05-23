import { Bank, DrawedStatus, SecurityStatus, SecurityType } from "@prisma/client";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { SecurityCreateRequest, SecurityUpdateRequest, SecurityUpdateStatusRequest } from "src/@shared/api/inhouse/security.request";

export class SecurityCreateRequestDto implements SecurityCreateRequest {
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

export class SecurityUpdateRequestDto implements SecurityUpdateRequest {
  @IsEnum(SecurityType)
  readonly securityType: SecurityType;

  @IsString()
  readonly securitySerial: string;

  @IsNumber()
  readonly securityAmount: number;

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

export class SecurityUpdateStatusRequestDto implements SecurityUpdateStatusRequest {
  @IsEnum(SecurityStatus)
  readonly securityStatus: SecurityStatus;

  @IsString()
  readonly memo: string;
}
