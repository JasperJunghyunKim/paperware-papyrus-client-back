import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import {
  BusinessRelationshipRequestAcceptRequest,
  BusinessRelationshipRequestListQuery,
  BusinessRelationshipRequestRejectRequest,
  SearchPartnerRequest,
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
