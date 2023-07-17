import * as popbill from 'popbill';
import * as dotenv from 'dotenv';
import { InternalServerErrorException } from '@nestjs/common';
import { PopbillTaxInvoice } from './popbill.interface';
import { TaxInvoicePurposeType } from 'src/@shared/models/enum';
import { Company } from '@prisma/client';
import { Util } from 'src/common';
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
      CorpNum,
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

export const createPopbillTaxInvoice = (params: {
  writeDate: string;
  invoicerMgtKey: string;
  purposeType: TaxInvoicePurposeType;
  dstCompanyRegistrationNumber: string;
  dstCompanyName: string;
  dstCompanyRepresentative: string;
  dstCompanyAddress: string;
  dstCompanyBizType: string;
  dstCompanyBizItme: string;
  dstEmail: string;
  srcCompanyRegistrationNumber: string;
  srcCompanyName: string;
  srcCompanyRepresentative: string;
  srcCompanyAddress: string;
  srcCompanyBizType: string;
  srcCompanyBizItem: string;
  srcEmail: string;
  srcEmail2: string;
  cash: number | null;
  check: number | null;
  note: number | null;
  credit: number | null;
  orders: {
    item: string;
    suppliedPrice: number;
    vatPrice: number;
  }[];
}): PopbillTaxInvoice => {
  const dstAddress = Util.decodeAddress(params.dstCompanyAddress);
  const srcAddress = Util.decodeAddress(params.srcCompanyAddress);

  const supplyCostTotal = params.orders.reduce((acc, cur) => {
    return acc + cur.suppliedPrice;
  }, 0);
  const taxTotal = params.orders.reduce((acc, cur) => {
    return acc + cur.vatPrice;
  }, 0);

  return {
    writeDate: params.writeDate,
    chargeDirection: '정과금',
    issueType: '정발행',
    purposeType: params.purposeType === 'CHARGE' ? '영수' : '청구',
    taxType: '과세', // TODO: 확인필요
    // 공급자 정보
    invoicerCorpNum: params.dstCompanyRegistrationNumber,
    invoicerMgtKey: params.invoicerMgtKey,
    invoicerTaxRegID: '', // TODO: 필요한지 확인 필요
    invoicerCorpName: params.dstCompanyName,
    invoicerCEOName: params.dstCompanyRepresentative,
    invoicerAddr:
      dstAddress.roadAddress +
      (dstAddress.detail ? ` ${dstAddress.detail}` : ''),
    invoicerBizClass: params.dstCompanyBizType,
    invoicerBizType: params.dstCompanyBizItme,
    invoicerContactName: params.dstCompanyRepresentative, // TODO: 대표자명이 들어가는건지?
    invoicerTEL: '', // TODO: 필수인지 확인
    invoicerHP: '', // TODO: 필수인지 확인
    invoicerEmail: params.dstEmail,
    invoicerSMSSendYN: false, // TODO: 발행 안내 문자 보내는지 확인
    // 공급받는자 정보
    invoiceeType: '사업자',
    invoiceeCorpNum: params.srcCompanyRegistrationNumber,
    invoiceeTaxRegID: '', // TODO: 필요한지 확인 필요
    invoiceeCorpName: params.srcCompanyName,
    invoiceeCEOName: params.srcCompanyRepresentative,
    invoiceeAddr:
      srcAddress.roadAddress +
      (srcAddress.detail ? ` ${srcAddress.detail}` : ''),
    invoiceeBizClass: params.srcCompanyBizType,
    invoiceeBizType: params.srcCompanyBizItem,
    invoiceeContactName1: params.srcCompanyRepresentative, // TODO: 대표자명이 들어가는건지?
    invoiceeTEL1: '', // TODO: 필수인지 확인
    invoiceeHP1: '', // TODO: 필수인지 확인
    invoiceeEmail1: params.srcEmail,
    // 세금계산서 기재정보
    supplyCostTotal: supplyCostTotal.toString(),
    taxTotal: taxTotal.toString(),
    totalAmount: (supplyCostTotal + taxTotal).toString(),
    serialNum: '', // TODO: 필수인지 확인
    cash: params.cash === null ? '' : params.cash.toString(),
    chkBill: params.check === null ? '' : params.check.toString(),
    note: params.note === null ? '' : params.note.toString(),
    credit: params.credit === null ? '' : params.credit.toString(),
    remark1: '',
    remark2: '',
    remark3: '',
    kwon: '',
    ho: '',
    businessLicenseYN: false,
    bankBookYN: false,
    detailList: [], // TODO: 작업
    addContactList: [], // TODO: 작업
  };
};

/** 세금계산서 발행(팝빌) */
export const registIssue = async (
  CorpNum: string,
  Taxinvoice: PopbillTaxInvoice,
) => {
  const result = await new Promise((res, rej) => {
    taxInvoiceService.registIssue(
      CorpNum,
      Taxinvoice,
      function (result) {
        res(result);
      },
      function (err) {
        console.log(err);
        rej(err);
      },
    );
  });
};
