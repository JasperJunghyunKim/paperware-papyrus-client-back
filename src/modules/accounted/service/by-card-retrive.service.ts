import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { ByCardResponseDto } from '../api/dto/card.response';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';

@Injectable()
export class ByCardRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getByCard(companyId: number, accountedType: AccountedType, accountedId: number): Promise<ByCardResponseDto> {
    return await lastValueFrom(from(
      this.prisma.accounted.findFirst({
        select: {
          id: true,
          accountedType: true,
          accountedDate: true,
          accountedSubject: true,
          accountedMethod: true,
          memo: true,
          byCard: {
            select: {
              cardAmount: true,
              totalAmount: true,
              approvalNumber: true,
              isCharge: true,
              chargeAmount: true,
              card: {
                select: {
                  id: true,
                  cardName: true,
                  cardCompany: true,
                  cardNumber: true,
                }
              },
              bankAccount: {
                select: {
                  id: true,
                  accountName: true,
                }
              }
            }
          },
          partner: {
            select: {
              id: true,
              partnerNickName: true,
              companyRegistrationNumber: true,
              company: {
                select: {
                  id: true,
                  companyRegistrationNumber: true,
                }
              }
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
          companyId: accounted?.partner?.company?.id,
          companyRegistrationNumber: accounted?.partner?.company?.companyRegistrationNumber,
          accountedId: accounted?.id,
          accountedType: accounted?.accountedType,
          accountedDate: accounted?.accountedDate.toISOString(),
          accountedSubject: accounted?.accountedSubject,
          accountedMethod: accounted?.accountedMethod,
          amount: accounted?.byCard?.cardAmount,
          memo: accounted?.memo,
          partnerNickName: accounted?.partner?.partnerNickName,
          bankAccountId: accounted?.byCard?.bankAccount?.id,
          accountName: accounted?.byCard?.bankAccount?.accountName,
          cardId: accounted?.byCard?.card?.id,
          cardName: accounted?.byCard?.card?.cardName,
          cardNumber: accounted?.byCard?.card?.cardNumber,
          cardCompany: accounted?.byCard?.card?.cardCompany,
          totalAmount: accounted?.byCard?.totalAmount,
          chargeAmount: accounted?.byCard?.chargeAmount,
          isCharge: accounted?.byCard?.isCharge,
          approvalNumber: accounted?.byCard?.approvalNumber,
        }
      }),
    ));
  }
}
