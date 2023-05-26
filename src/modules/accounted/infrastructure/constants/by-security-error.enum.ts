import { AppError } from 'src/@shared/models/error';

export const BY_SECURITY_ERROR = 'BySecurityError';

export enum BySecurityErrorEnum {
  BY_SECURITY_001 = 'BY_SECURITY_001',
  BY_SECURITY_002 = 'BY_SECURITY_002',
}

export const BySecurityError: Readonly<{ [key in BySecurityErrorEnum]: AppError }> = {
  [BySecurityErrorEnum.BY_SECURITY_001]: {
    name: BY_SECURITY_ERROR,
    code: BySecurityErrorEnum.BY_SECURITY_001,
    message: '유가증권이 %s 은(는) 배서지급에 할당 되어 수정이 되지 않습니다',
  },
  [BySecurityErrorEnum.BY_SECURITY_002]: {
    name: BY_SECURITY_ERROR,
    code: BySecurityErrorEnum.BY_SECURITY_001,
    message: '유가증권이 이미 사용 상태로 확인 됩니다. 유가증권 관리에 상태 확인 후 다시 시도해 주세요.',
  },
};
