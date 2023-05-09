import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class LocationRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip: number;
    take: number;
    companyId: number;
  }): Promise<Array<Model.Location>> {
    return await this.prisma.location.findMany({
      select: Selector.LOCATION,
      where: {
        companyId: params.companyId,
        isDeleted: false,
      },
      skip: params.skip,
      take: params.take,
    });
  }

  async getCount(params: { companyId: number }): Promise<number> {
    return await this.prisma.location.count({
      where: {
        companyId: params.companyId,
      },
    });
  }

  async getItem(id: number): Promise<Model.Location> {
    return await this.prisma.location.findUnique({
      select: Selector.LOCATION,
      where: { id },
    });
  }
}
