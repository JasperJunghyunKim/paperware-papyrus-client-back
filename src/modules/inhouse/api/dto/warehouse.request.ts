import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  WarehouseCreateRequest,
  WarehouseListQuery,
  WarehouseUpdateRequest,
} from 'src/@shared/api/inhouse/warehouse.request';

export class WarehouseListQueryDto implements WarehouseListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  readonly take: number = undefined;
}

export class WarehouseCreateRequestDto {
  @IsString()
  @MaxLength(50)
  name: string;
  @IsString()
  @MaxLength(4)
  code: string;
  @IsBoolean()
  isPublic: boolean;
  @IsString()
  @MaxLength(500)
  address: string;
}

export class WarehouseUpdateRequestDto {
  @IsString()
  @MaxLength(50)
  name: string;
  @IsString()
  @MaxLength(4)
  code: string;
  @IsBoolean()
  isPublic: boolean;
  @IsString()
  @MaxLength(500)
  address: string;
}
