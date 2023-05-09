import { IsNumber, IsString } from 'class-validator';
import { UserResponse } from 'src/@shared/api/user/user.response';

/**
 * 사용자 응답
 */
export class UserResponseDto implements UserResponse {
  /**
   * 사용자 아이디
   */
  @IsNumber()
  readonly userId: string;
  /**
   * 사용자명
   */
  @IsString()
  readonly userNm: string;
  /**
   * 비밀번호
   */
  @IsString()
  readonly userPwd: string;
  /**
   * 연락처
   */
  @IsString()
  readonly userPhone: string;
}
