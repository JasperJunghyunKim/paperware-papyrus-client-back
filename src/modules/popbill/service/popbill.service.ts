import * as popbill from 'popbill';
import * as dotenv from 'dotenv';
import { InternalServerErrorException } from '@nestjs/common';
import { CERT_NOT_FOUND_ERROR } from '../code/popbill.code';
dotenv.config();

interface PopbillResponse {
  code: number;
  message?: string;
}

const popbillConfig = {
  POPBILL_LINK_ID: process.env.POPBILL_LINK_ID,
  POPBILL_SECRET_KEY: process.env.POPBILL_SECRET_KEY,
  POPBILL_IS_TEST: process.env.POPBILL_IS_TEST === 'true',
  POPBILL_IP_RESTRICT_ON_OFF: process.env.POPBILL_IP_RESTRICT_ON_OFF === 'true',
  POPBILL_USE_STATIC_IP: process.env.POPBILL_USE_STATIC_IP === 'true',
  POPBILL_USE_LOCAL_TIME_YN: process.env.POPBILL_USE_LOCAL_TIME_YN === 'true',
  POPBILL_USER_ID: process.env.POPBILL_USER_ID,
  POPBILL_CORP_NUM: process.env.POPBILL_CORP_NUM,
};

popbill.config({
  // 링크아이디
  LinkID: popbillConfig.POPBILL_LINK_ID,

  // 비밀키
  SecretKey: popbillConfig.POPBILL_SECRET_KEY,

  // 연동환경 설정값, 개발용(true), 상업용(false)
  IsTest: popbillConfig.POPBILL_IS_TEST,

  // 인증토큰 IP제한기능 사용여부, 권장(true)
  IPRestrictOnOff: popbillConfig.POPBILL_IP_RESTRICT_ON_OFF,

  // 팝빌 API 서비스 고정 IP 사용여부, 기본값(false)
  UseStaticIP: popbillConfig.POPBILL_USE_STATIC_IP,

  // 로컬서버 시간 사용 여부 true(기본값) - 사용, false(미사용)
  UseLocalTimeYN: popbillConfig.POPBILL_USE_LOCAL_TIME_YN,

  // function 타입이 아닌 error 를 파라미터로 넣고 API 요청에 대한 응답이 실패할 경우 동작하게 되는 handler.
  defaultErrorHandler: function (Error) {
    console.log('Error Occur : [' + Error.code + '] ' + Error.message);
  },
});

// 세금계산서
const taxInvoiceService = popbill.TaxinvoiceService();

/** 인증서 URL */
export const getCertUrl = async (
  CorpNum: string,
  UserID: string,
): Promise<string> => {
  const url: string | Error = await new Promise((res, rej) => {
    taxInvoiceService.getTaxCertURL(
      CorpNum,
      UserID,
      function (url) {
        res(url);
      },
      function (err) {
        console.log(err);
        rej(err);
      },
    );
  });
  if (url instanceof Error) throw new InternalServerErrorException();

  return url;
};

/** 인증서 유효성 확인 */
export const checkCertValidation = async (CorpNum: string) => {
  const test: PopbillResponse = await new Promise((res, rej) => {
    taxInvoiceService.checkCertValidation(
      'CorpNum',
      function (result) {
        res(result);
      },
      function (err) {
        console.log(err);
        res(err);
      },
    );
  });

  return test.code;
};
