import { AppError } from 'src/@shared/models/error';

export const SALES_ERROR = 'StockError';

export enum SalesErrorEnum {
    SALES001 = 'SALES001',
    SALES002 = 'SALES002',
    SALES003 = 'SALES003',
    SALES004 = 'SALES004',
    SALES005 = 'SALES005',
}

export const SalesError: Readonly<{ [key in SalesErrorEnum]: AppError }> = {
    [SalesErrorEnum.SALES001]: {
        name: SALES_ERROR,
        code: 'SALES001',
        message: '%s 은(는) 존재하지 않는 매출처 입니다.',
    },
    [SalesErrorEnum.SALES002]: {
        name: SALES_ERROR,
        code: 'SALES002',
        message: '%s 은(는) 존재하지 않는 도착지 입니다.',
    },
    [SalesErrorEnum.SALES003]: {
        name: SALES_ERROR,
        code: 'SALES003',
        message: '%s 은(는) 올바르지 않은 도착지 입니다.',
    },
    [SalesErrorEnum.SALES004]: {
        name: SALES_ERROR,
        code: 'SALES004',
        message: '%s 은(는) 존재하지 않는 매출정보 입니다.',
    },
    [SalesErrorEnum.SALES005]: {
        name: SALES_ERROR,
        code: 'SALES005',
        message: '올바르지 않은 매출정보 상태입니다.',
    },
};
