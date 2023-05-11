import { Injectable } from '@nestjs/common';
import { AccountedType, Method } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { AccountedListResponse } from 'src/@shared/api';
import { PrismaService } from 'src/core';
import { EtcResponse } from '../api/dto/etc.response';
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
            id: partnerId !== 0 ? { equals: partnerId } : undefined,
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

  async getAccountedByCash(companyId: number, accountedType: AccountedType, accountedId: number): Promise<EtcResponse> {
    return await lastValueFrom(from(
      this.prisma.accounted.findFirst({
        select: {
          id: true,
          accountedType: true,
          accountedDate: true,
          accountedSubject: true,
          accountedMethod: true,
          memo: true,
          byCash: true,
          partner: {
            select: {
              id: true,
              partnerNickName: true,
            }
          }
        },
        where: {
          partner: {
            companyId,
          },
          accountedType,
          id: accountedId,
          isDeleted: false,
          byCash: {
            isDeleted: false,
          }
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [accountedId])),
      map((accounted) => {
        return {
          accountedId: accounted.id,
          accountedType: accounted.accountedType,
          accountedDate: accounted.accountedDate.toISOString(),
          accountedSubject: accounted.accountedSubject,
          accountedMethod: accounted.accountedMethod,
          amount: accounted.byCash.cashAmount,
          memo: accounted.memo,
          partnerId: accounted.partner.id,
          partnerNickName: accounted.partner.partnerNickName,
        }
      }),
    ));
  }

  async getAccountedByEtc(companyId: number, accountedType: AccountedType, accountedId: number): Promise<EtcResponse> {
    return await lastValueFrom(from(
      this.prisma.accounted.findFirst({
        select: {
          id: true,
          accountedType: true,
          accountedDate: true,
          accountedSubject: true,
          accountedMethod: true,
          memo: true,
          byEtc: true,
          partner: {
            select: {
              id: true,
              partnerNickName: true,
            }
          }
        },
        where: {
          partner: {
            companyId,
          },
          accountedType,
          id: accountedId,
          isDeleted: false,
          byEtc: {
            isDeleted: false,
          }
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [accountedId])),
      map((accounted) => {
        return {
          accountedId: accounted.id,
          accountedType: accounted.accountedType,
          accountedDate: accounted.accountedDate.toISOString(),
          accountedSubject: accounted.accountedSubject,
          accountedMethod: accounted.accountedMethod,
          amount: accounted.byEtc.etcAmount,
          memo: accounted.memo,
          partnerId: accounted.partner.id,
          partnerNickName: accounted.partner.partnerNickName,
        }
      }),
    ));
  }
}
