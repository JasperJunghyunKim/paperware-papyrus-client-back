import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { CompanyListQuery } from 'src/@shared/api/inhouse/company.request';

export class CompanyListQueryDto implements CompanyListQuery {
  @IsInt()
  @Type(() => Number)
  skip: number;
  @IsInt()
  @Type(() => Number)
  take: number;
}
