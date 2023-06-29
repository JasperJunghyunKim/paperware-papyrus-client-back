import { ConflictException, NotFoundException } from '@nestjs/common';
import { AppError } from 'src/@shared/models/error';

/**
 * 재고 수량 부족(`NOT_FOUND: 409`) 에러이다.
 */
export class InsufficientStockQuantityException extends ConflictException {
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
