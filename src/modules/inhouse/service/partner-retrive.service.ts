import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class PartnerRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip: number;
    take: number;
    companyId: number;
  }): Promise<Array<Model.Partner>> {
    return await this.prisma.partner.findMany({
      select: Selector.PARTNER,
      skip: params.skip,
      take: params.take,
      where: {
        companyId: params.companyId,
      },
    });
  }

  async getCount(params: { companyId: number }): Promise<number> {
    return await this.prisma.partner.count({
      where: {
        companyId: params.companyId,
      },
    });
  }

  async getItem(params: {
    companyId: number;
    companyRegistrationNumber: string;
  }): Promise<Model.Company> {
    return await this.prisma.partner.findUnique({
      select: Selector.COMPANY,
      where: {
        companyId_companyRegistrationNumber: {
          companyId: params.companyId,
          companyRegistrationNumber: params.companyRegistrationNumber,
        },
      },
    });
  }
}
