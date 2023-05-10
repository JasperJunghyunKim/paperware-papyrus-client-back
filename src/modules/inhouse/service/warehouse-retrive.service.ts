import { Injectable } from '@nestjs/common';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class WarehouseRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: { skip: number; take: number; companyId: number }) {
    return await this.prisma.warehouse.findMany({
      select: Selector.WAREHOUSE,
      where: {
        companyId: params.companyId,
        isDeleted: false,
      },
      skip: params.skip,
      take: params.take,
    });
  }

  async getCount(params: { companyId: number }) {
    return await this.prisma.warehouse.count({
      where: {
        companyId: params.companyId,
      },
    });
  }

  async getItem(id: number) {
    return await this.prisma.warehouse.findUnique({
      select: Selector.WAREHOUSE,
      where: { id },
    });
  }
}
