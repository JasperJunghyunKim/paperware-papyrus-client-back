import { ConflictException } from '@nestjs/common';
import { AppError } from 'src/@shared/models/error';

/**
 * 매출상태 맞지 않음(409) 에러
 */
export class InvalidSalesStatusException extends ConflictException {
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
