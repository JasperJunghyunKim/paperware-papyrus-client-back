import { AppError } from 'src/@shared/models/error';

export const PARTNER_ERROR = 'PartnerError';

export enum PartnerErrorEnum {
  PARTNER001 = 'PARTNER001',
}

export const StockError: Readonly<{ [key in PartnerErrorEnum]: AppError }> = {
  [PartnerErrorEnum.PARTNER001]: {
    name: PARTNER_ERROR,
    code: PartnerErrorEnum.PARTNER001,
    message: '%s 은(는) 존재하지 않는 파트너 입니다.',
  },
};
