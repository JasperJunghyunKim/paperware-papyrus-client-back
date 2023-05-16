import { AppError } from 'src/@shared/models/error';

export const CARD_ERROR = 'cardError';

export enum CardErrorEnum {
  CARD001 = 'CARD001',
}

export const CardError: Readonly<{ [key in CardErrorEnum]: AppError }> = {
  [CardErrorEnum.CARD001]: {
    name: CARD_ERROR,
    code: CardErrorEnum.CARD001,
    message: '%s 은(는) 존재하지 않는 카드 입니다.',
  },
};
