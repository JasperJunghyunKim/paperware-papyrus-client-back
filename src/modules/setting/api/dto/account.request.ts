import { IsDateString, IsEmail, IsString, Length } from 'class-validator';
import { AccountUpdateRequest } from 'src/@shared/api/setting/account.request';

export class AccountUpdateDto implements AccountUpdateRequest {
  @IsString()
  @Length(1, 20)
  readonly name: string;

  @IsDateString()
  readonly birthDate: string;

  @IsEmail()
  @Length(3, 150)
  readonly email: string;
}
