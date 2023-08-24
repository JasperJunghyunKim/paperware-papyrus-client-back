import { CartType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import {
  CartCreateRequest,
  CartListQuery,
} from 'src/@shared/api/trade/cart.request';

export class CartListDto implements CartListQuery {
  @IsEnum(CartType)
  readonly type: CartType;
}

export class CartCreateDto implements CartCreateRequest {
  @IsEnum(CartType)
  readonly type: CartType;

  @IsInt()
  @IsPositive()
  readonly companyId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly warehouseId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly planId: number | null = null;

  @IsInt()
  @IsPositive()
  readonly productId: number;

  @IsInt()
  @IsPositive()
  readonly packagingId: number;

  @IsInt()
  @IsPositive()
  readonly grammage: number;

  @IsInt()
  @IsPositive()
  readonly sizeX: number;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly sizeY: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperColorGroupId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperColorId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperPatternId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperCertId: number | null = null;

  @IsInt()
  @IsPositive()
  readonly quantity: number;

  @ValidateIf((obj, val) => val !== null)
  @IsString()
  @Length(1, 150)
  readonly memo: string | null = null;
}
