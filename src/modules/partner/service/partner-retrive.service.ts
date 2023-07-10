import { Injectable, NotFoundException } from '@nestjs/common';
import { from, lastValueFrom, map } from 'rxjs';
import { PrismaService } from 'src/core';
import { PartnerResponseDto } from '../api/dto/partner.request';

@Injectable()
export class PartnerRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getPartnerList(companyId: number): Promise<PartnerResponseDto[]> {
    return await lastValueFrom(
      from(
        this.prisma.partner.findMany({
          select: {
            companyId: true,
            partnerNickName: true,
            companyRegistrationNumber: true,
            creditLimit: true,
            memo: true,
            partnerTaxManager: true,
          },
          where: {
            companyId,
          },
        }),
      ).pipe(
        map((partner) => {
          return partner.map((partner) => {
            return {
              companyId: partner.companyId,
              companyRegistrationNumber: partner.companyRegistrationNumber,
              partnerNickName: partner.partnerNickName,
              creditLimit: partner.creditLimit,
              memo: partner.memo,
              partnerTaxManager: partner.partnerTaxManager,
            };
          });
        }),
      ),
    );
  }

  async getTaxManagerList(
    companyId: number,
    companyRegistrationNumber: string,
  ) {
    const partner = await this.prisma.partner.findUnique({
      include: {
        company: true,
        partnerTaxManager: {
          where: {
            isDeleted: false,
          },
        },
      },
      where: {
        companyId_companyRegistrationNumber: {
          companyId,
          companyRegistrationNumber,
        },
      },
    });
    if (!partner) throw new NotFoundException(`존재하지 않는 거래처입니다.`);

    return {
      items: partner.partnerTaxManager.map((m) => ({
        id: m.id,
        name: m.name,
        phoneNo: m.phoneNo,
        email: m.email,
        isDefault: m.isDefault,
      })),
      total: partner.partnerTaxManager.length,
    };
  }
}
