import { Injectable } from '@nestjs/common';
import { AccountedType, Method } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { AccountedListResponse } from 'src/@shared/api';
import { PrismaService } from 'src/core';
import { AccountedRequest } from '../api/dto/accounted.request';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';

@Injectable()
export class AccountedRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getAccountedList(companyId: number, accountedType: AccountedType, paidRequest: AccountedRequest): Promise<AccountedListResponse> {
    const { companyRegistrationNumber, accountedSubject, accountedMethod, accountedFromDate, accountedToDate } = paidRequest;
    const param: any = {
      accountedType,
      isDeleted: false,
    }

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
      }
    }

    return await lastValueFrom(from(
      this.prisma.accounted.findMany({
        select: {
          id: true,
          accountedType: true,
          accountedSubject: true,
          accountedMethod: true,
          accountedDate: true,
          memo: true,
          byCash: true,
          byEtc: true,
          byBankAccount: true,
          byCard: true,
          byOffset: true,
          partner: {
            select: {
              companyId: true,
              companyRegistrationNumber: true,
              partnerNickName: true,
              id: true,
              company: {
                select: {
                  id: true,
                }
              }
            }
          }
        },
        where: {
          partner: {
            companyId,
            companyRegistrationNumber: companyRegistrationNumber !== '' ? companyRegistrationNumber : undefined,
          },
          ...param,
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [paidRequest])),
      map((accountedList) => {
        const items = accountedList.map((accounted) => {

          const getAmount = (method) => {
            switch (method) {
              case Method.CASH:
                return accounted.byCash.cashAmount;
              case Method.ETC:
                return accounted.byEtc.etcAmount;
              case Method.ACCOUNT_TRANSFER:
                return accounted.byBankAccount.bankAccountAmount;
              case Method.CARD_PAYMENT:
                return accounted.byCard.cardAmount;
              case Method.OFFSET:
                return accounted.byOffset.offsetAmount;
            }
          }

          return {
            companyId: accounted.partner.companyId,
            companyRegistrationNumber: accounted.partner.companyRegistrationNumber,
            partnerNickName: accounted.partner.partnerNickName,
            accountedId: accounted.id,
            accountedType: accounted.accountedType,
            accountedDate: accounted.accountedDate.toISOString(),
            accountedMethod: accounted.accountedMethod,
            accountedSubject: accounted.accountedSubject,
            amount: getAmount(accounted.accountedMethod),
            memo: accounted.memo,
            gubun: '',
          }
        })

        return {
          items,
          total: items.length,
        }
      }),
    ));
  }
}
