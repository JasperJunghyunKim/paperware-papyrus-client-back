import { AppError } from 'src/@shared/models/error';

export const ACCOUNTED_ERROR = 'AccountedError';

export enum AccountedErrorEnum {
  ACCOUNTED001 = 'ACCOUNTED001',
}

export const AccountedError: Readonly<{
  [key in AccountedErrorEnum]: AppError;
}> = {
  [AccountedErrorEnum.ACCOUNTED001]: {
    name: ACCOUNTED_ERROR,
    code: AccountedErrorEnum.ACCOUNTED001,
    message: '%s 은(는) 존재하지 않는 데이터 입니다.',
  },
};
