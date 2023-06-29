import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { InhouseProcessCreateRequest } from 'src/@shared/api';

/** 내부공정 등록 */
export class InhouseProcessCreateDto implements InhouseProcessCreateRequest {
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly warehouseId: number | null = null;

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

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly sizeY: number = 0;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperColorGroupId: number | null = null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperColorId: number | null = null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperPatternId: number | null = null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly paperCertId: number | null = null;

  @IsInt()
  @IsPositive()
  readonly quantity: number;
}
