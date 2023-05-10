import { Injectable } from '@nestjs/common';
import { Method } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PaidListResponse } from 'src/@shared/api';
import { PrismaService } from 'src/core';
import { PaidEtcResponse } from '../api/dto/etc.response';
import { PaidRequest } from '../api/dto/paid.request';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';

@Injectable()
export class AccountedRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getPaidList(companyId: number, paidRequest: PaidRequest): Promise<PaidListResponse> {
    const { partnerId, partnerNickName, accountedSubject, accountedMethod, accountedFromDate, accountedToDate } = paidRequest;

    return await lastValueFrom(from(
      this.prisma.partner.findMany({
        select: {
          id: true,
          partnerNickName: true,
          accountedList: {
            select: {
              id: true,
              accountedType: true,
              accountedSubject: true,
              accountedMethod: true,
              accountedDate: true,
              memo: true,
              byCash: true,
              byEtc: true,
            },
          }
        },
        where: {
          companyId,
          id: partnerId,
          partnerNickName,
          accountedList: {
            some: {
              accountedType: 'PAID',
              accountedSubject,
              accountedMethod,
              accountedDate: {
                gte: accountedFromDate,
                lte: accountedToDate,
              },
            }
          }
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [paidRequest])),
      map((partnerList) => {
        const items = [];

        partnerList.forEach((partner) => {
          const data = partner.accountedList.map((accounted) => {
            return {
              partnerId: partner.id,
              partnerNickName: partner.partnerNickName,
              id: accounted.id,
              accountedDate: accounted.accountedDate,
              accountedMethod: accounted.accountedMethod,
              accountedSubject: accounted.accountedSubject,
              amount: accounted.accountedMethod === Method.CASH ? accounted.byCash : accounted.byEtc,
              memo: accounted.memo,
              gubun: accounted.accountedMethod === Method.CASH ? '현금' : '기타',
            }
          })

          items.push(data);
        })

        return {
          items,
          total: items.length,
        }
      }),
    ));
  }

  async getPaidByCash(companyId: number, paidId: number): Promise<PaidEtcResponse> {
    return await lastValueFrom(from(
      this.prisma.accounted.findFirst({
        select: {
          id: true,
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
          id: paidId,
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [paidId])),
      map((accounted) => {
        return {
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

  async getPaidByEtc(companyId: number, paidId: number): Promise<PaidEtcResponse> {
    return await lastValueFrom(from(
      this.prisma.accounted.findFirst({
        select: {
          id: true,
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
          id: paidId,
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [paidId])),
      map((accounted) => {
        return {
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
