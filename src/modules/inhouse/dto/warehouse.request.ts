import { IsBoolean, IsNumber, IsString, MaxLength } from 'class-validator';
// import {
//   WarehouseCreateRequest,
//   WarehouseListQuery,
//   WarehouseUpdateRequest,
// } from 'src/@shared/api/warehouse/warehouse.request';

export class WarehouseListQueryDto {
  @IsNumber()
  skip: string;
  @IsNumber()
  take: string;
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
  address: string;
}
