import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class VirtualCompanyRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    managedById: number;
    skip: number;
    take: number;
  }): Promise<Array<Model.Company>> {
    return await this.prisma.company.findMany({
      select: Selector.COMPANY,
      skip: params.skip,
      take: params.take,
      where: {
        managedById: params.managedById,
      },
    });
  }

  async getCount(params: { managedById: number }): Promise<number> {
    return await this.prisma.company.count({
      where: {
        managedById: params.managedById,
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
