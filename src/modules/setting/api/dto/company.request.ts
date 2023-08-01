import { IsString, Length } from 'class-validator';
import { SettingCompanyUpdateRequest } from 'src/@shared/api/setting/company.request';
import { IsOnlyNumber } from 'src/validator/is-only-number';

export class SettingCompanyUpdateDto implements SettingCompanyUpdateRequest {
  @IsString()
  @Length(1, 100)
  readonly businessName: string;
  @IsString()
  @Length(1, 100)
  readonly representative: string;
  @IsString()
  @IsOnlyNumber()
  @Length(10, 12)
  readonly phoneNo: string;
  @IsString()
  @IsOnlyNumber()
  @Length(10, 12)
  readonly faxNo: string;
  @IsString()
  @Length(1, 500)
  readonly address: string;
  @IsString()
  @Length(1, 100)
  readonly bizType: string;
  @IsString()
  @Length(1, 100)
  readonly bizItem: string;
}
