import { NotFoundException } from '@nestjs/common';
import { AppError } from 'src/@shared/models/error';

/**
 * 도착지 존재하지 않음(404) 에러
 */
export class LocationNotFoundException extends NotFoundException {
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
