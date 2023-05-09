import { AppError } from 'src/@shared/models/error';

export const STOCK_ERROR = 'StockError';

export enum StockErrorEnum {
  STOCK001 = 'STOCK001',
  STOCK002 = 'STOCK002',
  STOCK003 = 'STOCK003',
}

export const StockError: Readonly<{ [key in StockErrorEnum]: AppError }> = {
  [StockErrorEnum.STOCK001]: {
    name: STOCK_ERROR,
    code: 'STOCK001',
    message: '%s 은(는) 존재하지 않는 재고입니다.',
  },
  [StockErrorEnum.STOCK002]: {
    name: STOCK_ERROR,
    code: 'STOCK002',
    message: '존재하지 않는 재고그룹입니다.',
  },
  [StockErrorEnum.STOCK003]: {
    name: STOCK_ERROR,
    code: 'STOCK003',
    message: '재고의 수량이 부족합니다. (사용예정수량: %s, 가용수량: %s)',
  },
};
