import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import {
  SendSmsAuthenticationRequest,
  AuthNoCheckRequest,
  FindIdRequest,
  FindPasswordRequest,
  FindPasswordChangeRequest,
} from 'src/@shared/api/auth/auth.request';
import { IsName } from 'src/validator/is-name.validator';
import { IsOnlyNumber } from 'src/validator/is-only-number';
import { IsPassword } from 'src/validator/is-password.validator';

export class SendSmsAuthenticationDto implements SendSmsAuthenticationRequest {
  @IsString()
  @IsOnlyNumber()
  @Length(1, 11)
  readonly phoneNo: string;
}

export class AuthNoCheckDto implements AuthNoCheckRequest {
  @IsString()
  @IsOnlyNumber()
  @Length(1, 11)
  readonly phoneNo: string;

  @IsString()
  @Length(1, 10)
  readonly authNo: string;
}

export class FindIdDto implements FindIdRequest {
  @IsString()
  @IsName()
  @Length(1, 100)
  readonly name: string;

  @IsDateString()
  readonly birthDate: string;

  @IsString()
  @IsOnlyNumber()
  @Length(1, 11)
  readonly phoneNo: string;

  @IsString()
  @Length(1, 150)
  readonly authKey: string;
}

export class FindPasswordDto implements FindPasswordRequest {
  @IsString()
  @Length(1, 100)
  readonly username: string;

  @IsString()
  @IsName()
  @Length(1, 100)
  readonly name: string;

  @IsDateString()
  readonly birthDate: string;

  @IsString()
  @IsOnlyNumber()
  @Length(1, 11)
  readonly phoneNo: string;

  @IsString()
  @Length(1, 150)
  readonly authKey: string;
}

export class FindPasswordChangeDto implements FindPasswordChangeRequest {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly userId: number;

  @IsString()
  @Length(10, 30)
  @IsPassword()
  readonly password: string;

  @IsString()
  @Length(1, 150)
  readonly authKey: string;
}
