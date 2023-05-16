import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  BusinessRelationshipCompactListQuery,
  BusinessRelationshipCreateRequest,
  BusinessRelationshipListQuery,
} from 'src/@shared/api';

export class BusinessRelationshipListQueryDto
  implements BusinessRelationshipListQuery
{
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = undefined;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  srcCompanyId: number;
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  dstCompanyId: number;
}

export class BusinessRelationshipCreateRequestDto
  implements BusinessRelationshipCreateRequest
{
  @IsInt()
  srcCompanyId: number;
  @IsInt()
  dstCompanyId: number;
}

export class BusinessRelationshipCompactListQueryDto
  implements BusinessRelationshipCompactListQuery
{
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = undefined;
}
