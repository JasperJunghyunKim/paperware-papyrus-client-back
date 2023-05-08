import { BadRequestException } from '@nestjs/common';
import { AppError } from 'src/@shared/models/error';

/**
 * 도착지 올바르지 않음(400) 에러
 */
export class InvalidLocationException extends BadRequestException {
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
