import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  LocationCreateRequest,
  LocationListQuery,
  LocationUpdateRequest,
} from 'src/@shared/api/inhouse/location.request';

export class LocationListQueryDto implements LocationListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip = 0;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take: number = undefined;
}

export class LocationCreateRequestDto implements LocationCreateRequest {
  @IsString()
  @MaxLength(50)
  name: string;
  @IsString()
  @MaxLength(4)
  code: string;
  @IsBoolean()
  isPublic: boolean;
  @IsString()
  address: string;
}

export class LocationUpdateRequestDto implements LocationUpdateRequest {
  @IsString()
  @MaxLength(50)
  name: string;
  @IsString()
  @MaxLength(4)
  code: string;
  @IsBoolean()
  isPublic: boolean;
  @IsString()
  address: string;
}

export class LocationForSalesListQueryDto implements LocationListQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skip = 0;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  take: number = undefined;
  @Type(() => Number)
  @IsInt()
  targetCompanyId: number;
}
