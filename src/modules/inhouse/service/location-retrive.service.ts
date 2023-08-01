import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class LocationRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip: number;
    take: number;
    companyId: number;
  }): Promise<Array<Model.Location>> {
    const items = await this.prisma.location.findMany({
      select: Selector.LOCATION,
      where: {
        companyId: params.companyId,
        isDeleted: false,
      },
      skip: params.skip,
      take: params.take,
    });
    return items.map((item) => Util.serialize(item));
  }

  async getCount(params: { companyId: number }): Promise<number> {
    return await this.prisma.location.count({
      where: {
        companyId: params.companyId,
      },
    });
  }

  // 자사의 기타 도착지 (isPublic = true) 및 거래처(targetCompanyId)의 도착지 (isPublic = false)를 모두 가져온다.
  async getListForSales(params: {
    skip: number;
    take: number;
    companyId: number;
    targetCompanyId: number;
  }): Promise<Array<Model.Location>> {
    const items = await this.prisma.location.findMany({
      select: Selector.LOCATION,
      where: {
        isDeleted: false,
        OR: [
          {
            AND: [{ isPublic: true }, { companyId: params.companyId }],
          },
          {
            AND: [{ isPublic: false }, { companyId: params.targetCompanyId }],
          },
        ],
      },
      skip: params.skip,
      take: params.take,
    });

    return items.map((item) => Util.serialize(item));
  }

  async getCountForSales(params: {
    companyId: number;
    targetCompanyId: number;
  }): Promise<number> {
    return await this.prisma.location.count({
      where: {
        isDeleted: false,
        OR: [
          {
            isPublic: false,
            companyId: params.companyId,
          },
          {
            isPublic: true,
            companyId: params.targetCompanyId,
          },
        ],
      },
    });
  }

  async getItem(id: number): Promise<Model.Location> {
    const item = await this.prisma.location.findUnique({
      select: Selector.LOCATION,
      where: { id },
    });
    return Util.serialize(item);
  }
}
