import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { PrismaService } from 'src/core';
import { BySecurityItemResponse } from 'src/@shared/api/accounted/by-security.response';

@Injectable()
export class BySecurityRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySecurity(
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<BySecurityItemResponse> {
    const accounted = await this.prisma.accounted.findFirst({
      select: {
        id: true,
        companyId: true,
        partnerCompanyRegistrationNumber: true,
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
              },
            },
            endorsementType: true,
            endorsement: true,
          },
        },
      },
      where: {
        companyId,
        accountedType,
        id: accountedId,
        isDeleted: false,
        bySecurity: {
          isDeleted: false,
        },
      },
    });

    const partner = await this.prisma.partner.findUnique({
      where: {
        companyId_companyRegistrationNumber: {
          companyId: accounted.companyId,
          companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
        },
      },
    });

    return {
      companyId: accounted.companyId,
      companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
      partnerNickName: partner.partnerNickName || '',
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
        id: accounted.bySecurity.securityId,
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
    };
  }
}
