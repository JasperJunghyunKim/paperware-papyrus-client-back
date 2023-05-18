import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';
import { ByCardItemResponse } from 'src/@shared/api/accounted/by-card.response';

@Injectable()
export class ByCardRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getAccountedByCard(companyId: number, accountedType: AccountedType, accountedId: number): Promise<ByCardItemResponse> {
    return await lastValueFrom(from(
      this.prisma.accounted.findFirst({
        select: {
          id: true,
          accountedType: true,
          accountedDate: true,
          accountedSubject: true,
          accountedMethod: true,
          memo: true,
          byCard: true,
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
          byCard: {
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
          amount: accounted.byCard.cardAmount,
          memo: accounted.memo,
          partnerId: accounted.partner.id,
          partnerNickName: accounted.partner.partnerNickName,
          cardId: accounted.byCard.cardId,
          totalAmount: accounted.byCard.totalAmount,
          chargeAmount: accounted.byCard.chargeAmount,
          isCharge: accounted.byCard.isCharge,
          approvalNumber: accounted.byCard.approvalNumber,
        }
      }),
    ));
  }
}
