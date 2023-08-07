import * as dayjs from 'dayjs';

export function dateToIso8601(date: Date | string | null | undefined): string {
  if (date === null || date === undefined) {
    return null;
  }
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
}

export function iso8601ToDate(iso8601: string | null | undefined): Date {
  if (iso8601 === null || iso8601 === undefined) {
    return null;
  }
  return new Date(iso8601);
}

export function bigintToNumber(value: bigint): number {
  return Number(value);
}

export function numberToBigint(value: number): bigint {
  return BigInt(value);
}

export function parseNumber(
  value: string | undefined | null,
): number | undefined {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

export function inc<T extends string>(value: T, ...array: T[]): boolean {
  return array.includes(value);
}

export type Serialized<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Array<infer U>
    ? Array<Serialized<U>>
    : T[K] extends object
    ? Serialized<T[K]>
    : T[K] extends T | null | undefined
    ? Serialized<T>
    : T[K];
};

export function serialize<T extends object>(
  obj: T | null | undefined,
): Serialized<T> | null | undefined {
  if (obj === null) return null;
  if (obj === undefined) return undefined;

  const newObj: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (value instanceof Date) {
      newObj[key] = dateToIso8601(value);
    } else if (Array.isArray(value)) {
      newObj[key] = value.map((v) => serialize(v));
    } else if (typeof value === 'object' && value !== null) {
      newObj[key] = serialize(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

/** 종이재고 */
export const serialP = (invoiceCode: string) =>
  `P${invoiceCode}${Math.random().toString().substring(2, 12)}`.toUpperCase();

/** 송장 */
export const serialI = (invoiceCode: string) =>
  `I${invoiceCode}${Math.random().toString().substring(2, 12)}`.toUpperCase();

/** 거래 */
export const serialT = (invoiceCode: string) =>
  `T${invoiceCode}${Math.random().toString().substring(2, 12)}`.toUpperCase();

/** 내부작업 */
export const serialW = (invoiceCode: string) =>
  `W${invoiceCode}${Math.random().toString().substring(2, 12)}`.toUpperCase();

/** 퀵주문 */
export const serialQ = (invoiceCode: string, month: string, num: number) => {
  if (invoiceCode.length !== 4 || month.length !== 4 || num < 1 || num > 999999)
    throw new Error(
      `serialQ invalid parameter: ${invoiceCode}, ${month}, ${num}`,
    );
  return `Q${invoiceCode}${month}${String(num).padStart(6, '0')}`.toUpperCase();
};

/** 배송 */
export const serialS = (invoiceCode: string, month: string, num: number) => {
  if (invoiceCode.length !== 4 || month.length !== 4 || num < 1 || num > 999999)
    throw new Error(
      `serialS invalid parameter: ${invoiceCode}, ${month}, ${num}`,
    );
  return `S${invoiceCode}${month}${String(num).padStart(6, '0')}`.toUpperCase();
};

/** serial format */
export function formatSerial(serial: string): string {
  if (serial?.length !== 15) {
    return serial;
  }
  const header = serial[0];
  return header === 'P'
    ? `P-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : header === 'T'
    ? `T-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : header === 'I'
    ? `I-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : header === 'W'
    ? `W-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : `${serial}`;
}

/** 세금계산서 키 */
export const invoicerMgtKey = (
  companyRegistrationNumber: string,
  issuedDate: string,
) => {
  if (companyRegistrationNumber.length !== 10)
    throw new Error(
      `사업자등록번호는 10자리로 구성되어야 합니다. (${companyRegistrationNumber})`,
    );
  if (issuedDate.length !== 6)
    throw new Error(`발행일은 6자리로 구성되어야 합니다. (${issuedDate})`);

  return `${companyRegistrationNumber}${issuedDate}${Math.random()
    .toString()
    .substring(2, 10)}`;
};

export const searchKeywordsToIntArray = (keywords: string): number[] => {
  if (!keywords) return [];
  return keywords.split('|').map((keyword) => parseInt(keyword, 10));
};

export const searchKeywordsToStringArray = (keywords: string): string[] => {
  if (!keywords) return [];
  return keywords.split('|').map((keyword) => keyword);
};

export const isSameMonth = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
  );
};

export const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const addMonth = (date: Date, month: number): Date => {
  // month달 후의 1일
  let addMonthFirstDate = new Date(
    date.getFullYear(),
    date.getMonth() + month,
    1,
  );

  // month달 후의 말일
  let addMonthLastDate = new Date(
    addMonthFirstDate.getFullYear(),
    addMonthFirstDate.getMonth() + 1,
    0,
  );

  let result = addMonthFirstDate;
  if (date.getDate() > addMonthLastDate.getDate()) {
    result.setDate(addMonthLastDate.getDate());
  } else {
    result.setDate(date.getDate());
  }

  return result;
};

export interface Address {
  roadAddress: string;
  roadAddressEnglish: string;
  jibunAddress: string;
  jibunAddressEnglish: string;
  zonecode: string;
  detail: string;
}

export function decodeAddress(address: string | null | undefined): Address {
  try {
    if (address === null || address === undefined || address === '') {
      throw new Error();
    }

    const [zonecode, roadAddress, jibunAddress, detail] = address
      .split(']]')
      .map((p) => p.trim().replace('[[', ''));

    const [roadAddressKorean, roadAddressEnglish] = roadAddress.split('::');
    const [jibunAddressKorean, jibunAddressEnglish] = jibunAddress.split('::');

    return {
      zonecode,
      roadAddress: roadAddressKorean,
      roadAddressEnglish,
      jibunAddress: jibunAddressKorean,
      jibunAddressEnglish,
      detail,
    };
  } catch {
    return {
      zonecode: '',
      roadAddress: '',
      roadAddressEnglish: '',
      jibunAddress: '',
      jibunAddressEnglish: '',
      detail: '',
    };
  }
}
