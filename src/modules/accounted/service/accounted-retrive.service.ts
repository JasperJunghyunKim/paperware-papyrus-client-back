import { Injectable } from '@nestjs/common';
import { AccountedType, Method, Partner, Prisma } from '@prisma/client';
import { AccountedListResponse } from 'src/@shared/api';
import { PrismaService } from 'src/core';
import { AccountedRequest } from '../api/dto/accounted.request';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';

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

    const partners = await this.prisma.partner.findMany({
      where: {
        companyId,
      },
      orderBy: {
        id: 'asc',
      },
      skip,
      take,
    });
    console.log(partners);

    const typeQuery =
      accountedType === 'PAID'
        ? Prisma.sql`o.srcCompanyId = ${companyId}`
        : Prisma.sql`o.dstCompanyId = ${companyId}`;
    const partnerQuery =
      accountedType === 'PAID'
        ? Prisma.sql`dstCompany.companyRegistrationNumber IN (${Prisma.join(
            partners.map((p) => p.companyRegistrationNumber),
          )})`
        : Prisma.sql`srcCompany.companyRegistrationNumber IN (${Prisma.join(
            partners.map((p) => p.companyRegistrationNumber),
          )})`;

    const items = await this.prisma.$queryRaw`
      SELECT *
        FROM \`Order\`      AS o
        
        JOIN Company        AS srcCompany       ON srcCompany.id = o.srcCompanyId
        JOIN Company        AS dstCompany       ON dstCompany.id = o.dstCompanyId

       WHERE ${typeQuery}
         AND ${partnerQuery}
    `;

    return items;
  }
}
