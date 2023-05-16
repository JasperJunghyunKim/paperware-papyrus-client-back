import { AppError } from 'src/@shared/models/error';

export const BANK_ACCOUNT_ERROR = 'cardError';

export enum BankAccountErrorEnum {
  BANK_ACCOUNT001 = 'CARD001',
}

export const PartnerError: Readonly<{ [key in BankAccountErrorEnum]: AppError }> = {
  [BankAccountErrorEnum.BANK_ACCOUNT001]: {
    name: BANK_ACCOUNT_ERROR,
    code: BankAccountErrorEnum.BANK_ACCOUNT001,
    message: '%s 은(는) 존재하지 않는 카드 입니다.',
  },
};
