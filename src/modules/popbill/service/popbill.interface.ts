export interface PopbillTaxInvoiceDetail {
  serialNum: number; // 일련번호, 1부터 순차기재
  purchaseDT: string; // 거래일자, 형식 : yyyyMMdd
  itemName: string;
  spec: string;
  qty: string; // 수량, 소수점 2자리까지 기재 가능
  unitCost: string; // 단가, 소수점 2자리까지 기재 가능
  supplyCost: string; // 공급가액, 소수점 기재불가, 원단위 이하는 절사하여 표현
  tax: string; // 세액, 소수점 기재불가, 원단위 이하는 절사하여 표현
  remark: string; // 비고
}

export interface PopbillTaxInvoiceContact {
  // 일련번호, 1부터 순차기재
  serialNum: number;
  // 담당자명
  contactName: string;
  // 담당자 메일
  // 팝빌 개발환경에서 테스트하는 경우에도 안내 메일이 전송되므로,
  // 실제 거래처의 메일주소가 기재되지 않도록 주의
  email: string;
}

export interface PopbillTaxInvoice {
  // 작성일자, 날짜형식 yyyyMMdd
  writeDate: string;
  // 과금방향
  chargeDirection: '정과금' | '역과금';
  // 발행형태
  issueType: '정발행' | '역발행' | '위수탁';
  // 영수/청구
  purposeType: '영수' | '청구' | '없음';
  // 과세형태
  taxType: '과세' | '영세' | '면세';

  /************************************************************************
   *                              공급자 정보
   **************************************************************************/
  // 공급자 사업자번호, "-" 제외 10자리
  invoicerCorpNum: string;
  // [정발행시 필수] 문서번호, 최대 24자리, 영문, 숫자 "-", "_"를 조합하여 사업자별로 중복되지 않도록 구성
  invoicerMgtKey: string;
  // 공급자 종사업장 식별번호, 필요시 기재, 4자리 숫자
  invoicerTaxRegID: string;
  // 공급자 상호
  invoicerCorpName: string;
  // 대표자 성명
  invoicerCEOName: string;
  // 공급자 주소
  invoicerAddr: string;
  // 공급자 종목
  invoicerBizClass: string;
  // 공급자 업태
  invoicerBizType: string;
  // 공급자 담당자명
  invoicerContactName: string;
  // 공급자 연락처
  invoicerTEL: string;
  // 공급자 휴대폰번호
  invoicerHP: string;
  // 공급자 메일주소
  invoicerEmail: string;
  // 발행 안내 문자 전송여부 (true / false 중 택 1)
  // └ true = 전송 , false = 미전송
  // └ 공급받는자 (주)담당자 휴대폰번호 {invoiceeHP1} 값으로 문자 전송
  // - 전송 시 포인트 차감되며, 전송실패시 환불처리
  invoicerSMSSendYN: boolean;

  /************************************************************************
   *                           공급받는자 정보
   **************************************************************************/

  // 공급받는자 구분, {사업자, 개인, 외국인} 중 기재
  invoiceeType: '사업자' | '개인' | '외국인';
  // 공급받는자 사업자번호
  // - {invoiceeType}이 "사업자" 인 경우, 사업자번호 (하이픈 ("-") 제외 10자리)
  // - {invoiceeType}이 "개인" 인 경우, 주민등록번호 (하이픈 ("-") 제외 13자리)
  // - {invoiceeType}이 "외국인" 인 경우, "9999999999999" (하이픈 ("-") 제외 13자리)
  invoiceeCorpNum: string;
  // 공급받는자 종사업장 식별번호, 필요시 기재, 4자리 숫자
  invoiceeTaxRegID: string;
  // 공급받는자 상호
  invoiceeCorpName: string;
  // 공급받는자 대표자 성명
  invoiceeCEOName: string;
  // 공급받는자 주소
  invoiceeAddr: string;
  // 공급받는자 종목
  invoiceeBizClass: string;
  // 공급받는자 업태
  invoiceeBizType: string;
  // 공급받는자 담당자명
  invoiceeContactName1: string;
  // 공급받는자 연락처
  invoiceeTEL1: string;
  // 공급받는자 휴대폰번호
  invoiceeHP1: string;
  // 공급받는자 이메일 주소
  // 팝빌 개발환경에서 테스트하는 경우에도 안내 메일이 전송되므로,
  // 실제 거래처의 메일주소가 기재되지 않도록 주의
  invoiceeEmail1: string;

  /************************************************************************
   *                           세금계산서 기재정보
   **************************************************************************/

  // 공급가액 합계
  supplyCostTotal: string;
  // 세액합계
  taxTotal: string;
  // 합계금액
  totalAmount: string;
  // 기재 상 "일련번호"" 항목
  serialNum: string;
  // 기재 상 "현금"" 항목
  cash: string;
  // 기재 상 "수표" 항목
  chkBill: string;
  // 기재 상 "어음" 항목
  note: string;
  // 기재 상 "외상" 항목
  credit: string;

  // 비고
  // {invoiceeType}이 "외국인" 이면 remark1 필수
  // - 외국인 등록번호 또는 여권번호 입력
  remark1: string;
  remark2: string;
  remark3: string;

  // 기재 상 "권" 항목, 최대값 32767
  kwon: string;

  // 기재 상 "호" 항목, 최대값 32767
  ho: string;

  // 사업자등록증 이미지 첨부여부 (true / false 중 택 1)
  // └ true = 첨부 , false = 미첨부(기본값)
  // - 팝빌 사이트 또는 인감 및 첨부문서 등록 팝업 URL (GetSealURL API) 함수를 이용하여 등록
  businessLicenseYN: boolean;
  // 통장사본 이미지 첨부여부 (true / false 중 택 1)
  // └ true = 첨부 , false = 미첨부(기본값)
  // - 팝빌 사이트 또는 인감 및 첨부문서 등록 팝업 URL (GetSealURL API) 함수를 이용하여 등록
  bankBookYN: boolean;

  /************************************************************************
   *                           상세항목(품목) 정보 (최대 99건)
   **************************************************************************/

  detailList: PopbillTaxInvoiceDetail[];

  /************************************************************************
   *                         수정세금계산서 기재정보
   * - 수정세금계산서를 작성하는 경우에만 값을 기재합니다.
   * - 수정세금계산서 관련 정보는 연동매뉴얼 또는 개발가이드 링크 참조
   * - [참고] 수정세금계산서 작성방법 안내 - https://developers.popbill.com/guide/taxinvoice/node/introduction/modified-taxinvoice
   **************************************************************************/

  // [수정세금계산서 발행시 필수] 수정사유코드, 수정사유에 따라 1~6 숫자 기재
  modifyCode: string;
  // [수정세금계산서 발행시 필수] 원본세금계산서 국세청승인번호 기재
  orgNTSConfirmNum: string;

  /************************************************************************
   *                             추가담당자 정보
   * - 세금계산서 발행안내 메일을 수신받을 공급받는자 담당자가 다수인 경우
   * 추가 담당자 정보를 등록하여 발행안내메일을 다수에게 전송할 수 있습니다. (최대 5명)
   **************************************************************************/

  // 추가담당자 정보
  addContactList: PopbillTaxInvoiceContact[];
}
