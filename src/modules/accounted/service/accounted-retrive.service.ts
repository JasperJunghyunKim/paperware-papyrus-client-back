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
    const { partnerId, accountedSubject, accountedMethod, accountedFromDate, accountedToDate } = paidRequest;
    const param: any = {
      accountedType,
      isDeleted: false,
    }

    if (partnerId !== 0) {
      param.partnerId = {
        equals: partnerId,
      };
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
          partner: {
            select: {
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
            companyId
          },
          ...param,
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [paidRequest])),
      map((accountedList) => {
        const items = accountedList.map((accounted) => {
          return {
            partnerId: accounted.partner.id,
            partnerNickName: accounted.partner.partnerNickName,
            accountedId: accounted.id,
            accountedType: accounted.accountedType,
            accountedDate: accounted.accountedDate.toISOString(),
            accountedMethod: accounted.accountedMethod,
            accountedSubject: accounted.accountedSubject,
            amount: accounted.accountedMethod === Method.CASH ? accounted.byCash.cashAmount : accounted.byEtc.etcAmount,
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
