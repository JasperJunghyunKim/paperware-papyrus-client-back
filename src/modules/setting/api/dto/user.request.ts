import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import {
  SettingUserListQuery,
  UserCreateRequest,
  UserIdCheckQuery,
} from 'src/@shared/api/setting/user.request';
import { IsId } from 'src/validator/is-id.validator';
import { IsName } from 'src/validator/is-name.validator';
import { IsPassword } from 'src/validator/is-password.validator';

export class SettingUserListDto implements SettingUserListQuery {
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
  readonly take: number = 30;
}

export class SettingUserIdCheckDto implements UserIdCheckQuery {
  @IsString()
  @IsId()
  @Length(1, 100)
  readonly username: string;
}

export class SettingUserCreateDto implements UserCreateRequest {
  @IsString()
  @IsId()
  @Length(1, 100)
  readonly username: string;

  @IsString()
  @IsPassword()
  @Length(10, 30)
  readonly password: string;

  @IsString()
  @IsName()
  @Length(1, 100)
  readonly name: string;

  @IsDateString()
  readonly birthDate: string;

  @IsString()
  @IsEmail()
  @Length(1, 150)
  readonly email: string;
}
