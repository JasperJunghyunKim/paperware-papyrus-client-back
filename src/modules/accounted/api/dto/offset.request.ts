import { AccountedType, Method, Subject } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  ByOffsetCreateRequest,
  ByOffsetUpdateRequest,
} from 'src/@shared/api/accounted/by-offset.request';

export class ByOffsetCreateRequestDto implements ByOffsetCreateRequest {
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
}

export class ByOffsetUpdateRequestDto implements ByOffsetUpdateRequest {
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
