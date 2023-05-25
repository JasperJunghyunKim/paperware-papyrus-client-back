import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { AccountedNotFoundException } from '../infrastructure/exception/by-security-status.exception';
import { BySecurityItemResponse } from 'src/@shared/api/accounted/by-security.response';

@Injectable()
export class BySecurityRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getBySecurity(companyId: number, accountedType: AccountedType, accountedId: number): Promise<BySecurityItemResponse> {
    return await lastValueFrom(from(
      this.prisma.accounted.findFirst({
        select: {
          id: true,
          accountedType: true,
          accountedDate: true,
          accountedSubject: true,
          accountedMethod: true,
          memo: true,
          bySecurity: {
            select: {
              securityId: true,
              security: {
                select: {
                  id: true,
                  securityType: true,
                  securitySerial: true,
                  securityAmount: true,
                  securityStatus: true,
                  drawedStatus: true,
                  drawedDate: true,
                  drawedBank: true,
                  drawedBankBranch: true,
                  drawedRegion: true,
                  drawer: true,
                  maturedDate: true,
                  payingBank: true,
                  payingBankBranch: true,
                  payer: true,
                  memo: true,
                }
              },
              endorsementType: true,
              endorsement: true,
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
          bySecurity: {
            isDeleted: false,
          }
        }
      })
    ).pipe(
      throwIfEmpty(() => new AccountedNotFoundException(AccountedError.ACCOUNTED001, [accountedId])),
      map((accounted) => {
        return {
          companyId: accounted.partner.company.id,
          companyRegistrationNumber: accounted.partner.company.companyRegistrationNumber,
          partnerNickName: accounted.partner.partnerNickName,
          accountedId: accounted.id,
          accountedType: accounted.accountedType,
          accountedDate: accounted.accountedDate?.toISOString(),
          accountedSubject: accounted.accountedSubject,
          accountedMethod: accounted.accountedMethod,
          memo: accounted.memo,
          amount: accounted.bySecurity.security.securityAmount,
          endorsementType: accounted.bySecurity.endorsementType,
          endorsement: accounted.bySecurity.endorsement,
          security: {
            securityId: accounted.bySecurity.securityId,
            securityType: accounted.bySecurity.security.securityType,
            securitySerial: accounted.bySecurity.security.securitySerial,
            securityAmount: accounted.bySecurity.security.securityAmount,
            securityStatus: accounted.bySecurity.security.securityStatus,
            drawedStatus: accounted.bySecurity.security.drawedStatus,
            drawedDate: accounted.bySecurity.security.drawedDate?.toISOString(),
            drawedBank: accounted.bySecurity.security.drawedBank,
            drawedBankBranch: accounted.bySecurity.security.drawedBankBranch,
            drawedRegion: accounted.bySecurity.security.drawedRegion,
            drawer: accounted.bySecurity.security.drawer,
            maturedDate: accounted.bySecurity.security.maturedDate?.toISOString(),
            payingBank: accounted.bySecurity.security.payingBank,
            payingBankBranch: accounted.bySecurity.security.payingBankBranch,
            payer: accounted.bySecurity.security.payer,
            memo: accounted.bySecurity.security.memo,
          },
        }
      }),
    ));
  }
}
