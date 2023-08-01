import { IsString, Length } from 'class-validator';
import {
  SendSmsAuthenticationRequest,
  AuthNoCheckRequest,
} from 'src/@shared/api/auth/auth.request';
import { IsOnlyNumber } from 'src/validator/is-only-number';

export class SendSmsAuthenticationDto implements SendSmsAuthenticationRequest {
  @IsOnlyNumber()
  @Length(1, 11)
  readonly phoneNo: string;
}

export class AuthNoCheckDto implements AuthNoCheckRequest {
  @IsOnlyNumber()
  @Length(1, 11)
  readonly phoneNo: string;

  @IsString()
  @Length(1, 10)
  readonly authNo: string;
}
