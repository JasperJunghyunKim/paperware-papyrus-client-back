import { AppError } from 'src/@shared/models/error';

export const SECURITY_ERROR = 'SecurityError';

export enum SecurityErrorEnum {
  SECURITY_001 = 'SECURITY_001',
  SECURITY_002 = 'SECURITY_002',
  SECURITY_003 = 'SECURITY_003',
}

export const SecurityError: Readonly<{ [key in SecurityErrorEnum]: AppError }> = {
  [SecurityErrorEnum.SECURITY_001]: {
    name: SECURITY_ERROR,
    code: SecurityErrorEnum.SECURITY_001,
    message: '%s 유가증권은 자사 발행이 아닌 경우 삭제할 수 없습니다. 수금내역조회에서 삭제 하세요.',
  },
  [SecurityErrorEnum.SECURITY_002]: {
    name: SECURITY_ERROR,
    code: SecurityErrorEnum.SECURITY_002,
    message: '%s 유가증권은 사용되었습니다. 지급에서 사용을 삭제한 후 변경하여 다시 시도해주세요.',
  },
  [SecurityErrorEnum.SECURITY_003]: {
    name: SECURITY_ERROR,
    code: SecurityErrorEnum.SECURITY_003,
    message: '%s 유가증권은 사용되었습니다. 상태를 변경하고 다시 시도해주세요.',
  },
};
