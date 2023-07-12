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

  async getTaxManager(id: number, companyId: number) {
    const taxManager = await this.prisma.partnerTaxManager.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
    if (!taxManager)
      throw new NotFoundException(`존재하지 않는 세금계산서담당자입니다.`);

    const partner = await this.prisma.partner.findUnique({
      where: {
        id: taxManager.partnerId,
      },
    });

    if (partner.companyId !== companyId)
      throw new NotFoundException(`존재하지 않는 세금계산서담당자입니다.`);

    return {
      id: taxManager.id,
      name: taxManager.name,
      phoneNo: taxManager.phoneNo,
      email: taxManager.email,
      isDefault: taxManager.isDefault,
    };
  }
}
