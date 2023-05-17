import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { EtcResponse } from '../api/dto/etc.response';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';

@Injectable()
export class ByEtcRetriveService {
  constructor(private readonly prisma: PrismaService) { }

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
