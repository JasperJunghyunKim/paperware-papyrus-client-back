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

    return null;
  }
}
