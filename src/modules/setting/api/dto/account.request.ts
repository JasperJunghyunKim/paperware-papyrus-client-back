import {
  IsDateString,
  IsEmail,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import {
  AccountPasswordUpdateRequest,
  AccountPhoneNoUpdateRequest,
  AccountUpdateRequest,
} from 'src/@shared/api/setting/account.request';
import { IsOnlyNumber } from 'src/validator/is-only-number';
import { IsPassword } from 'src/validator/is-password.validator';

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

export class AccountPasswordUpdateDto implements AccountPasswordUpdateRequest {
  @IsString()
  @Length(10, 30)
  @IsPassword()
  readonly password: string;
}

export class AccountPhoneNoUpdateDto implements AccountPhoneNoUpdateRequest {
  @IsString()
  @IsOnlyNumber()
  @Length(1, 11)
  readonly phoneNo: string;

  @IsString()
  @Length(1, 150)
  readonly authKey: string;
}
