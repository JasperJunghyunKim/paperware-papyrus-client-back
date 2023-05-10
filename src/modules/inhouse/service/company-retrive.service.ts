import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class CompanyRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip: number;
    take: number;
  }): Promise<Array<Model.Company>> {
    return await this.prisma.company.findMany({
      select: Selector.COMPANY,
      skip: params.skip,
      take: params.take,
      where: {
        managedById: null,
      },
    });
  }

  async getCount(): Promise<number> {
    return await this.prisma.company.count({
      where: {
        managedById: null,
      },
    });
  }

  async getItem(id: number): Promise<Model.Company> {
    return await this.prisma.company.findUnique({
      select: Selector.COMPANY,
      where: { id },
    });
  }
}
