import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AccountedType,
  Method,
  OrderStatus,
  Partner,
  Prisma,
} from '@prisma/client';
import { AccountedListResponse } from 'src/@shared/api';
import { PrismaService } from 'src/core';
import { AccountedRequest } from '../api/dto/accounted.request';
import * as dayjs from 'dayjs';

export interface Price {
  partnerCompanyRegistrationNumber: string;
  partnerNickName: string;
  creditLimit: number;
  totalPrice: number;
  price1: number;
  price2: number;
  price3: number;
  price4: number;
  price5: number;
  price6: number;
  price7: number;
  total?: number;
}

@Injectable()
export class AccountedRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccountedList(
    companyId: number,
    accountedType: AccountedType,
    paidRequest: AccountedRequest,
  ): Promise<AccountedListResponse> {
    const {
      companyId: conditionCompanyId,
      companyRegistrationNumber,
      accountedSubject,
      accountedMethod,
      accountedFromDate,
      accountedToDate,
    } = paidRequest;
    const param: any = {
      accountedType,
      isDeleted: false,
    };

    if (accountedSubject !== 'All') {
      param.accountedSubject = {
        equals: accountedSubject,
      };
    }

    if (accountedMethod !== 'All') {
      param.accountedMethod = {
        equals: accountedMethod,
      };
    }

    if (accountedFromDate !== '' && accountedToDate !== '') {
      param.accountedDate = {
        gte: new Date(accountedFromDate),
        lte: new Date(accountedToDate),
      };
    }

    const accountedList = await this.prisma.accounted.findMany({
      select: {
        id: true,
        partnerCompanyRegistrationNumber: true,
        accountedType: true,
        accountedSubject: true,
        accountedMethod: true,
        accountedDate: true,
        memo: true,
        byCash: true,
        byEtc: true,
        byBankAccount: {
          select: {
            bankAccountAmount: true,
            bankAccount: {
              select: {
                accountName: true,
              },
            },
          },
        },
        byCard: {
          select: {
            isCharge: true,
            cardAmount: true,
            chargeAmount: true,
            totalAmount: true,
            card: {
              select: {
                cardName: true,
              },
            },
            bankAccount: {
              select: {
                accountName: true,
              },
            },
          },
        },
        byOffset: true,
        bySecurity: {
          select: {
            security: {
              select: {
                securityAmount: true,
                securityStatus: true,
                securitySerial: true,
              },
            },
          },
        },
      },
      where: {
        companyId,
        companyRegistrationNumber: companyRegistrationNumber
          ? companyRegistrationNumber
          : undefined,
        ...param,
      },
    });

    const partners = await this.prisma.partner.findMany({
      where: {
        companyId,
      },
    });
    const partnerMap = new Map<string, Partner>();
    for (const partner of partners) {
      partnerMap.set(partner.companyRegistrationNumber, partner);
    }

    const items = accountedList.map((accounted) => {
      const getAmount = (method): number => {
        switch (method) {
          case Method.CASH:
            return accounted.byCash.cashAmount;
          case Method.PROMISSORY_NOTE:
            return accounted.bySecurity.security.securityAmount;
          case Method.ETC:
            return accounted.byEtc.etcAmount;
          case Method.ACCOUNT_TRANSFER:
            return accounted.byBankAccount.bankAccountAmount;
          case Method.CARD_PAYMENT:
            return accounted.byCard.isCharge
              ? accounted.byCard.totalAmount
              : accounted.byCard.cardAmount;
          case Method.OFFSET:
            return accounted.byOffset.offsetAmount;
        }
      };

      const getGubun = (method): string => {
        switch (method) {
          case Method.CASH:
            return '';
          case Method.PROMISSORY_NOTE:
            return accounted.bySecurity.security.securitySerial;
          case Method.ETC:
            return '';
          case Method.ACCOUNT_TRANSFER:
            return accounted.byBankAccount.bankAccount.accountName;
          case Method.CARD_PAYMENT:
            return accounted.byCard.card
              ? accounted.byCard.card.cardName
              : accounted.byCard.bankAccount.accountName;
          case Method.OFFSET:
            return '';
        }
      };

      return {
        companyId,
        companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
        partnerNickName:
          partnerMap.get(accounted.partnerCompanyRegistrationNumber)
            ?.partnerNickName || '',
        accountedId: accounted.id,
        accountedType: accounted.accountedType,
        accountedDate: accounted.accountedDate.toISOString(),
        accountedMethod: accounted.accountedMethod,
        accountedSubject: accounted.accountedSubject,
        amount: getAmount(accounted.accountedMethod),
        memo: accounted.memo,
        gubun: getGubun(accounted.accountedMethod),
        securityStatus:
          accounted.accountedMethod === Method.PROMISSORY_NOTE
            ? accounted.bySecurity.security.securityStatus
            : undefined,
      };
    });

    return {
      items,
      total: items.length,
    };
  }

  async getUnpaidList(params: {
    companyId: number;
    skip: number;
    take: number;
    accountedType: AccountedType;
    companyRegistrationNumbers: string[];
    minAmount: number | null;
    maxAmount: number | null;
    year: number | null;
    month: number | null;
  }) {
    const {
      companyId,
      skip,
      take,
      accountedType,
      companyRegistrationNumbers,
      minAmount,
      maxAmount,
    } = params;

    // footer 조건
    const partnerQuery =
      companyRegistrationNumbers.length > 0
        ? Prisma.sql`AND p.companyRegistrationNumber IN (${Prisma.join(
            companyRegistrationNumbers.map((p) => p),
          )})`
        : Prisma.empty;

    // 표 조건
    const orderJoinQuery =
      accountedType === 'PAID'
        ? Prisma.sql`o.srcCompanyId = ${companyId} AND o.dstCompanyId = partnerCompany.id`
        : Prisma.sql`o.dstCompanyId = ${companyId} AND o.srcCompanyId = partnerCompany.id`;

    const minAmountQuery =
      minAmount !== null
        ? Prisma.sql`AND totalPrice >= ${minAmount}`
        : Prisma.empty;

    const maxAmountQuery =
      maxAmount !== null
        ? Prisma.sql`AND totalPrice <= ${maxAmount}`
        : Prisma.empty;

    /** 테스트용 */
    const nowQuery =
      params.year !== null && params.month !== null
        ? Prisma.sql`${
            params.year +
            '-' +
            params.month.toString().padStart(2, '0') +
            '-10 00:00:00.000'
          }`
        : Prisma.sql`NOW()`;

    // 날짜(DB 시간 기준)
    const now: any[] = await this.prisma.$queryRaw`
      SELECT YEAR(CONVERT_TZ(DATE_ADD(${nowQuery}, INTERVAL 1 MONTH), '+00:00', '+09:00')) AS year1
            , MONTH(CONVERT_TZ(DATE_ADD(${nowQuery}, INTERVAL 1 MONTH), '+00:00', '+09:00')) AS month1
            , YEAR(CONVERT_TZ(${nowQuery}, '+00:00', '+09:00')) AS year2
            , MONTH(CONVERT_TZ(${nowQuery}, '+00:00', '+09:00')) AS month2
            , YEAR(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 1 MONTH), '+00:00', '+09:00')) AS year3
            , MONTH(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 1 MONTH), '+00:00', '+09:00')) AS month3
            , YEAR(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 2 MONTH), '+00:00', '+09:00')) AS year4
            , MONTH(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 2 MONTH), '+00:00', '+09:00')) AS month4
            , YEAR(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 3 MONTH), '+00:00', '+09:00')) AS year5
            , MONTH(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 3 MONTH), '+00:00', '+09:00')) AS month5
            , YEAR(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 4 MONTH), '+00:00', '+09:00')) AS year6
            , MONTH(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 4 MONTH), '+00:00', '+09:00')) AS month6
            , YEAR(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 5 MONTH), '+00:00', '+09:00')) AS year7
            , MONTH(CONVERT_TZ(DATE_SUB(${nowQuery}, INTERVAL 5 MONTH), '+00:00', '+09:00')) AS month7
    `;

    const year1 = Number(now[0].year1);
    const month1 = Number(now[0].month1);
    const year2 = Number(now[0].year2);
    const month2 = Number(now[0].month2);
    const year3 = Number(now[0].year3);
    const month3 = Number(now[0].month3);
    const year4 = Number(now[0].year4);
    const month4 = Number(now[0].month4);
    const year5 = Number(now[0].year5);
    const month5 = Number(now[0].month5);
    const year6 = Number(now[0].year6);
    const month6 = Number(now[0].month6);
    const year7 = Number(now[0].year7);
    const month7 = Number(now[0].month7);

    const lastDay = dayjs(year7 + '-' + month7)
      .endOf('month')
      .get('date');

    const totalPrices: Price[] = await this.prisma.$queryRaw`
      SELECT partner.id AS partnerId
            , partner.companyRegistrationNumber AS partnerCompanyRegistrationNumber
            , partner.partnerNickName AS partnerNickName
            , partner.creditLimit AS creditLimit
            
            -- 거래금액 - 지급/수금
            , IFNULL(SUM(tp.suppliedPrice + tp.vatPrice), 0) 
              - IFNULL(paidPrice.totalPrice, 0) AS totalPrice
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) >= ${`${year1}-${month1
              .toString()
              .padStart(
                2,
                '0',
              )}-01 00:00:00.000`} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price1, 0) AS price1
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year2} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month2} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price2, 0)  AS price2
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year3} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month3} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price3, 0)  AS price3
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year4} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month4} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price4, 0)  AS price4
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year5} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month5} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price5, 0)  AS price5
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year6} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month6} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price6, 0)  AS price6
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) <= ${`${year7}-${month7
              .toString()
              .padStart(
                2,
                '0',
              )}-${lastDay} 23:59:59.999`} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price7, 0) AS price7

            -- total
            , COUNT(1) OVER() AS total

        FROM (
          SELECT p.id, p.companyId, p.companyRegistrationNumber, p.partnerNickName, p.creditLimit
            FROM Partner    AS p
          WHERE p.companyId = ${companyId} 
          ${partnerQuery}

          ORDER BY p.id
        ) AS partner
        JOIN Company AS partnerCompany ON partnerCompany.companyRegistrationNumber = partner.companyRegistrationNumber AND (partnerCompany.managedById = ${companyId} OR partnerCompany.managedById IS NULL)

        -- 거래금액
      LEFT JOIN \`Order\`  AS o              ON ${orderJoinQuery}
      LEFT JOIN TradePrice AS tp             ON tp.orderId = o.id AND tp.companyId = ${companyId}

        -- 지급/수금
      LEFT JOIN (
      SELECT a.partnerCompanyRegistrationNumber
            , IFNULL(SUM(IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0)), 0) AS totalPrice
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) >= ${`${year1}-${month1
              .toString()
              .padStart(
                2,
                '0',
              )}-01 00:00:00.000`} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price1
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year2} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month2} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price2
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year3} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month3} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price3
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year4} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month4} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price4
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year5} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month5} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price5
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year6} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month6} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price6
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) <= ${`${year7}-${month7
              .toString()
              .padStart(
                2,
                '0',
              )}-${lastDay} 23:59:59.999`} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price7

        FROM Accounted      AS a
      LEFT JOIN ByCash         AS c  ON c.accountedId = a.id
      LEFT JOIN ByEtc          AS e  ON e.accountedId = a.id
      LEFT JOIN ByBankAccount  AS b  ON b.accountedId = a.id
      LEFT JOIN ByCard         AS c2 ON c2.accountedId = a.id
      LEFT JOIN BySecurity     AS s  ON s.accountedId = a.id
      LEFT JOIN Security       AS s2 ON s2.id = s.securityId
      LEFT JOIN ByOffset       AS o  ON o.accountedId = a.id

      WHERE a.companyId = ${companyId}
        AND a.accountedType = ${accountedType}

      GROUP BY a.partnerCompanyRegistrationNumber
      ) AS paidPrice ON paidPrice.partnerCompanyRegistrationNumber = partner.companyRegistrationNumber

        GROUP BY partner.companyRegistrationNumber
                , partner.id

          HAVING 1=1
            ${minAmountQuery}
            ${maxAmountQuery}
            
        ORDER BY partner.id
      `;

    const total = Number(totalPrices[0]?.total || 0);
    const totalPrice = {
      totalPrice: 0,
      price1: 0,
      price2: 0,
      price3: 0,
      price4: 0,
      price5: 0,
      price6: 0,
      price7: 0,
    };
    for (const price of totalPrices) {
      totalPrice.totalPrice += price.totalPrice;
      totalPrice.price1 += price.price1;
      totalPrice.price2 += price.price2;
      totalPrice.price3 += price.price3;
      totalPrice.price4 += price.price4;
      totalPrice.price5 += price.price5;
      totalPrice.price6 += price.price6;
      totalPrice.price7 += price.price7;
    }

    const partners = await this.prisma.partner.findMany({
      where: {
        companyId,
        companyRegistrationNumber:
          companyRegistrationNumbers.length > 0
            ? {
                in: companyRegistrationNumbers,
              }
            : undefined,
      },
      orderBy: {
        id: 'asc',
      },
      skip,
      take,
    });
    if (partners.length === 0) {
      return {
        items: [],
        total,
        totalPrice,
      };
    }

    // 거래금액
    const prices: Price[] = await this.prisma.$queryRaw`
      SELECT partner.id AS partnerId
            , partner.companyRegistrationNumber AS partnerCompanyRegistrationNumber
            , partner.partnerNickName AS partnerNickName
            , partner.creditLimit AS creditLimit
            
            -- 거래금액 - 지급/수금
            , IFNULL(SUM(tp.suppliedPrice + tp.vatPrice), 0) 
              - IFNULL(paidPrice.totalPrice, 0) AS totalPrice
              , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) >= ${`${year1}-${month1
                .toString()
                .padStart(
                  2,
                  '0',
                )}-01 00:00:00.000`} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price1, 0) AS price1
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year2} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month2} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price2, 0)  AS price2
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year3} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month3} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price3, 0)  AS price3
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year4} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month4} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price4, 0)  AS price4
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year5} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month5} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price5, 0)  AS price5
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${year6} AND MONTH(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) = ${month6} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price6, 0)  AS price6
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(o.orderDate, '+00:00', '+09:00')) <= ${`${year7}-${month7
              .toString()
              .padStart(
                2,
                '0',
              )}-${lastDay} 23:59:59.999`} THEN tp.suppliedPrice + tp.vatPrice END), 0) 
              - IFNULL(paidPrice.price7, 0) AS price7

        FROM (
          SELECT p.id, p.companyId, p.companyRegistrationNumber, p.partnerNickName, p.creditLimit
            FROM Partner    AS p
           WHERE p.companyId = ${companyId} 
             AND p.companyRegistrationNumber IN (${Prisma.join(
               partners.map((p) => p.companyRegistrationNumber),
             )})
          ORDER BY p.id
        ) AS partner
        JOIN Company AS partnerCompany ON partnerCompany.companyRegistrationNumber = partner.companyRegistrationNumber AND (partnerCompany.managedById = ${companyId} OR partnerCompany.managedById IS NULL)

        -- 거래금액
   LEFT JOIN \`Order\`  AS o              ON ${orderJoinQuery}
   LEFT JOIN TradePrice AS tp             ON tp.orderId = o.id AND tp.companyId = ${companyId}

        -- 지급/수금
   LEFT JOIN (
      SELECT a.partnerCompanyRegistrationNumber
            , IFNULL(SUM(IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0)), 0) AS totalPrice
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) >= ${`${year1}-${month1
              .toString()
              .padStart(
                2,
                '0',
              )}-01 00:00:00.000`} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price1
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year2} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month2} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price2
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year3} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month3} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price3
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year4} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month4} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price4
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year5} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month5} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price5
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year6} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month6} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price6
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) <= ${`${year7}-${month7
              .toString()
              .padStart(
                2,
                '0',
              )}-${lastDay} 23:59:59.999`} THEN IFNULL(c.cashAmount, 0) + IFNULL(e.etcAmount, 0) + IFNULL(b.bankAccountAmount, 0) + IFNULL(c2.totalAmount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.offsetAmount, 0) END), 0) AS price7

        FROM Accounted      AS a
    LEFT JOIN ByCash         AS c  ON c.accountedId = a.id
    LEFT JOIN ByEtc          AS e  ON e.accountedId = a.id
    LEFT JOIN ByBankAccount  AS b  ON b.accountedId = a.id
    LEFT JOIN ByCard         AS c2 ON c2.accountedId = a.id
    LEFT JOIN BySecurity     AS s  ON s.accountedId = a.id
    LEFT JOIN Security       AS s2 ON s2.id = s.securityId
    LEFT JOIN ByOffset       AS o  ON o.accountedId = a.id
    
    WHERE a.companyId = ${companyId}
      AND a.accountedType = ${accountedType}
      AND a.partnerCompanyRegistrationNumber IN (${Prisma.join(
        partners.map((p) => p.companyRegistrationNumber),
      )})

    GROUP BY a.partnerCompanyRegistrationNumber
   ) AS paidPrice ON paidPrice.partnerCompanyRegistrationNumber = partner.companyRegistrationNumber
      
        GROUP BY partner.companyRegistrationNumber
                , partner.id
          HAVING 1=1
            ${minAmountQuery}
            ${maxAmountQuery}
            
        ORDER BY partner.id
    `;

    return {
      items: prices.map((p) => {
        return {
          companyRegistrationNumber: p.partnerCompanyRegistrationNumber,
          partnerNickName: p.partnerNickName,
          creditLimit: Number(p.creditLimit || 0),
          totalPrice: Number(p.totalPrice || 0),
          price1: Number(p.price1 || 0),
          price2: Number(p.price2 || 0),
          price3: Number(p.price3 || 0),
          price4: Number(p.price4 || 0),
          price5: Number(p.price5 || 0),
          price6: Number(p.price6 || 0),
          price7: Number(p.price7 || 0),
        };
      }),
      total,
      totalPrice,
    };
  }
}
