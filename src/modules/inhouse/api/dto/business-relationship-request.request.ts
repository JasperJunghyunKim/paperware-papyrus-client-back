import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import {
  BusinessRelationshipRequestAcceptRequest,
  BusinessRelationshipRequestCreateRequest,
  BusinessRelationshipRequestListQuery,
  BusinessRelationshipRequestRejectRequest,
} from 'src/@shared/api';

export class BusinessRelationshipRequestListQueryDto
  implements BusinessRelationshipRequestListQuery
{
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  skip = 0;
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  take: number = undefined;
}

export class BusinessRelationshipRequestCreateRequestDto
  implements BusinessRelationshipRequestCreateRequest
{
  @IsInt()
  companyId: number;
}

export class BusinessRelationshipRequestAcceptRequestDto
  implements BusinessRelationshipRequestAcceptRequest
{
  @IsInt()
  companyId: number;
}

export class BusinessRelationshipRequestRejectRequestDto
  implements BusinessRelationshipRequestRejectRequest
{
  @IsInt()
  companyId: number;
}
