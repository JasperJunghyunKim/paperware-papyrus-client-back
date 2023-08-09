import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountedType,
  Method,
  OrderStatus,
  Partner,
  Prisma,
  Subject,
} from '@prisma/client';
import { AccountedListResponse } from 'src/@shared/api';
import { PrismaService } from 'src/core';
import * as dayjs from 'dayjs';
import { Selector, Util } from 'src/common';
import { Model } from 'src/@shared';

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

  async getList(params: {
    companyId: number;
    skip: number;
    take: number;
    accountedType: AccountedType;
    companyRegistrationNumbers: string[];
    minAccountedDate: string | null;
    maxAccountedDate: string | null;
    accountedSubjects: Subject[];
    accountedMethods: Method[];
  }): Promise<{
    items: Model.Accounted[];
    total: number;
  }> {
    const partnerQuery =
      params.companyRegistrationNumbers.length > 0
        ? Prisma.sql`AND a.companyRegistrationNumber IN (${Prisma.join(
            params.companyRegistrationNumbers,
          )})`
        : Prisma.empty;
    const minDateQuery = params.minAccountedDate
      ? Prisma.sql`AND DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) >= DATE(CONVERT_TZ(${params.minAccountedDate}, '+00:00', '+09:00'))`
      : Prisma.empty;
    const maxDateQuery = params.minAccountedDate
      ? Prisma.sql`AND DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) <= DATE(CONVERT_TZ(${params.maxAccountedDate}, '+00:00', '+09:00'))`
      : Prisma.empty;

    params.accountedSubjects = Array.from(
      new Set(
        params.accountedSubjects.filter((s) =>
          Util.inc(
            s,
            'ACCOUNTS_RECEIVABLE',
            'ADVANCES',
            'ETC',
            'MISCELLANEOUS_INCOME',
            'PRODUCT_SALES',
            'UNPAID',
          ),
        ),
      ),
    );
    const subjectQuery =
      params.accountedSubjects.length > 0
        ? Prisma.sql`AND a.accountedSubject IN (${Prisma.join(
            params.accountedSubjects,
          )})`
        : Prisma.empty;

    params.accountedMethods = Array.from(
      new Set(
        params.accountedMethods.filter((m) =>
          Util.inc(
            m,
            'ACCOUNT_TRANSFER',
            'CARD_PAYMENT',
            'CASH',
            'ETC',
            'OFFSET',
            'PROMISSORY_NOTE',
          ),
        ),
      ),
    );
    const methodQuery =
      params.accountedMethods.length > 0
        ? Prisma.sql`AND a.accountedMethod IN (${Prisma.join(
            params.accountedMethods,
          )})`
        : Prisma.empty;

    const searchAccounted: {
      id: number;
      total: bigint;
    }[] = await this.prisma.$queryRaw`
      SELECT a.id AS id
            
            , COUNT(1) OVER() AS total
        FROM Accounted    AS a
       
       WHERE a.companyId = ${params.companyId}
         AND a.accountedType = ${params.accountedType}
         AND isDeleted = ${false}
         ${partnerQuery}
         ${minDateQuery}
         ${maxDateQuery}
         ${subjectQuery}
         ${methodQuery}

       ORDER BY id DESC
       
       LIMIT ${params.skip}, ${params.take}
    `;
    if (searchAccounted.length === 0) {
      return {
        items: [],
        total: 0,
      };
    }

    const items = await this.prisma.accounted.findMany({
      select: Selector.ACCOUNTED,
      where: {
        id: {
          in: searchAccounted.map((a) => a.id),
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      items: items.map((item) => Util.serialize(item)),
      total: Number(searchAccounted[0].total),
    };
  }

  async get(companyId: number, acccountedId: number): Promise<Model.Accounted> {
    const item = await this.prisma.accounted.findFirst({
      select: Selector.ACCOUNTED,
      where: {
        id: acccountedId,
        companyId,
        isDeleted: false,
      },
    });
    if (!item)
      throw new NotFoundException(`존재하지 않는 수금/지급 정보입니다.`);

    return Util.serialize(item);
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
        JOIN (
          SELECT b.*, dstCompany.companyRegistrationNumber
            FROM BusinessRelationship AS b
            JOIN Company              AS dstCompany    ON dstCompany.id = b.dstCompanyId
          WHERE b.srcCompanyId = ${companyId}
        ) AS br ON br.companyRegistrationNumber = partner.companyRegistrationNumber
        JOIN Company AS partnerCompany ON partnerCompany.companyRegistrationNumber = partner.companyRegistrationNumber AND (partnerCompany.managedById = ${companyId} OR partnerCompany.managedById IS NULL)

        -- 거래금액
      LEFT JOIN \`Order\`  AS o              ON ${orderJoinQuery}
      LEFT JOIN TradePrice AS tp             ON tp.orderId = o.id AND tp.companyId = ${companyId}

        -- 지급/수금
      LEFT JOIN (
      SELECT a.companyRegistrationNumber
            , IFNULL(SUM(IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0)), 0) AS totalPrice
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) >= ${`${year1}-${month1
              .toString()
              .padStart(
                2,
                '0',
              )}-01 00:00:00.000`} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price1
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year2} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month2} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price2
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year3} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month3} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price3
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year4} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month4} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price4
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year5} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month5} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price5
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year6} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month6} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price6
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) <= ${`${year7}-${month7
              .toString()
              .padStart(
                2,
                '0',
              )}-${lastDay} 23:59:59.999`} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price7

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

      GROUP BY a.companyRegistrationNumber
      ) AS paidPrice ON paidPrice.companyRegistrationNumber = partner.companyRegistrationNumber

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
        JOIN (
          SELECT b.*, dstCompany.companyRegistrationNumber
            FROM BusinessRelationship AS b
            JOIN Company              AS dstCompany    ON dstCompany.id = b.dstCompanyId
          WHERE b.srcCompanyId = ${companyId}
        ) AS br ON br.companyRegistrationNumber = partner.companyRegistrationNumber
        JOIN Company AS partnerCompany ON partnerCompany.companyRegistrationNumber = partner.companyRegistrationNumber AND (partnerCompany.managedById = ${companyId} OR partnerCompany.managedById IS NULL)

        -- 거래금액
   LEFT JOIN \`Order\`  AS o              ON ${orderJoinQuery}
   LEFT JOIN TradePrice AS tp             ON tp.orderId = o.id AND tp.companyId = ${companyId}

        -- 지급/수금
   LEFT JOIN (
      SELECT a.companyRegistrationNumber
            , IFNULL(SUM(IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0)), 0) AS totalPrice
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) >= ${`${year1}-${month1
              .toString()
              .padStart(
                2,
                '0',
              )}-01 00:00:00.000`} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(s2.securityAmount, 0) + IFNULL(o.amount, 0) END), 0) AS price1
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year2} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month2} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price2
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year3} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month3} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price3
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year4} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month4} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price4
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year5} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month5} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price5
            , IFNULL(SUM(CASE WHEN YEAR(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${year6} AND MONTH(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) = ${month6} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price6
            , IFNULL(SUM(CASE WHEN DATE(CONVERT_TZ(a.accountedDate, '+00:00', '+09:00')) <= ${`${year7}-${month7
              .toString()
              .padStart(
                2,
                '0',
              )}-${lastDay} 23:59:59.999`} THEN IFNULL(c.amount, 0) + IFNULL(e.amount, 0) + IFNULL(b.amount, 0) + IFNULL(c2.amount, 0) + IFNULL(o.amount, 0) + IFNULL(s2.securityAmount, 0) END), 0) AS price7

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
      AND a.companyRegistrationNumber IN (${Prisma.join(
        partners.map((p) => p.companyRegistrationNumber),
      )})

    GROUP BY a.companyRegistrationNumber
   ) AS paidPrice ON paidPrice.companyRegistrationNumber = partner.companyRegistrationNumber
      
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
