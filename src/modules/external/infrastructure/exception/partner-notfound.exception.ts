import { NotFoundException } from '@nestjs/common';
import { AppError } from 'src/@shared/models/error';

/**
 * 파트너(거래처) 존재하지 않음(404) 에러
 */
export class PartnerNotFoundException extends NotFoundException {
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
