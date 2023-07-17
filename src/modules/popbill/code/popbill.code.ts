/// response code

/** 성공 */
export const SUCCESS = 1;

/** 공급받는자 사업자등록번호가 유효하지 않음 */
export const INVALID_SRC_COMPANY_REGISTRATION_NUMBER_ERROR = -11001021;
/** 인증서 찾을 수 없음 */
export const CERT_NOT_FOUND_ERROR = -10002009;
/** 인증서 유효하지 않음 */
export const CERT_NOT_VALID_ERROR = -11002031;
/** 사업자 등록번호 찾을 수 없음 */
export const CORP_NUM_NOT_FOUND_ERROR = -99003008;

/// status code
export enum PopbillStateCode {
  ISSUED = 300,
  ON_SEND = 303,
  SENDED = 304,
  SEND_FAILED = 305,
  ISSUE_CANCELLED = 600,
}
