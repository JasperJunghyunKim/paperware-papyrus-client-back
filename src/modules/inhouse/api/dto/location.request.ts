import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, MaxLength } from 'class-validator';
import {
  LocationCreateRequest,
  LocationListQuery,
  LocationUpdateRequest,
} from 'src/@shared/api/inhouse/location.request';

export class LocationListQueryDto implements LocationListQuery {
  @IsInt()
  @Type(() => Number)
  skip: number;
  @IsInt()
  @Type(() => Number)
  take: number;
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
