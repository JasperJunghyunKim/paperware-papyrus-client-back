import { NotFoundException } from '@nestjs/common';
import { AppError } from 'src/@shared';

/**
 * 사용자 데이터 없음(`NOT_FOUND: 404`) 에러이다.
 */
export class UserNotFoundException extends NotFoundException {
  // eslint-disable-next-line constructor-super
  constructor(errData?: AppError | string, ...msgArgs: Array<string> | Array<number>) {
    if (errData) {
      if (typeof errData === 'string') {
        super(errData);
      } else {
        const iError = errData as AppError;
        iError.msgArgs = msgArgs;
        super(iError);
      }
    }
  }
}
