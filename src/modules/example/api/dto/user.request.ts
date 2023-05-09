import { IsNumber, IsString } from 'class-validator';
import { UserRequest } from 'src/@shared/api/user/user.request';

/**
 * 사용자 요청
 */
export class UserRequestDto implements UserRequest {
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
