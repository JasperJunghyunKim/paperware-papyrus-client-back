import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { AccountedNotFoundException } from '../infrastructure/exception/by-security-status.exception';
import { ByOffsetItemResponseDto } from '../api/dto/offset.response';

@Injectable()
export class ByOffsetRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getOffset(companyId: number, accountedType: AccountedType, accountedId: number): Promise<ByOffsetItemResponseDto> {
    return await lastValueFrom(from(
      this.prisma.accounted.findFirst({
        select: {
          id: true,
          accountedType: true,
          accountedDate: true,
          accountedSubject: true,
          accountedMethod: true,
          memo: true,
          byOffset: true,
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
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [accountedId])),
      map((accounted) => {
        return {
          companyId: accounted.partner.company.id,
          companyRegistrationNumber: accounted.partner.company.companyRegistrationNumber,
          accountedId: accounted.id,
          accountedType: accounted.accountedType,
          accountedDate: accounted.accountedDate.toISOString(),
          accountedSubject: accounted.accountedSubject,
          accountedMethod: accounted.accountedMethod,
          amount: accounted.byOffset.offsetAmount,
          memo: accounted.memo,
          partnerNickName: accounted.partner.partnerNickName,
        }
      }),
    ));
  }
}
