import { UnprocessableEntityException } from '@nestjs/common';
import { AppError } from 'src/@shared/models/error';

/**
 * 유가증권 에러이다.
 */
export class SecurityPaidException extends UnprocessableEntityException {
  // eslint-disable-next-line constructor-super
  constructor(
    errData?: AppError | string,
    ...msgArgs: Array<string> | Array<number> | any
  ) {
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
