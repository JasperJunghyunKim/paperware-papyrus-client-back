import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class CompanyRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip: number;
    take: number;
  }): Promise<Array<Model.Company>> {
    const items = await this.prisma.company.findMany({
      select: Selector.COMPANY,
      skip: params.skip,
      take: params.take,
      where: {
        managedById: null,
      },
    });
    return items.map((item) => Util.serialize(item));
  }

  async getCount(): Promise<number> {
    return await this.prisma.company.count({
      where: {
        managedById: null,
      },
    });
  }

  async getItem(id: number): Promise<Model.Company> {
    const item = await this.prisma.company.findUnique({
      select: Selector.COMPANY,
      where: { id },
    });
    return Util.serialize(item);
  }
}
