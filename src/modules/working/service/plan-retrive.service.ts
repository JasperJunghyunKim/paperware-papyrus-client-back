import { Injectable } from '@nestjs/common';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class PlanRetriveService {
  constructor(private prisma: PrismaService) {}

  async getPlanList(params: {
    companyId: number;
    skip?: number;
    take?: number;
  }) {
    const { skip, take } = params;
    return await this.prisma.plan.findMany({
      select: Selector.PLAN,
      where: {
        companyId: params.companyId,
        isDeleted: false,
      },
      skip,
      take,
    });
  }

  async getPlanListCount(params: { companyId: number }) {
    return await this.prisma.plan.count({
      where: {
        companyId: params.companyId,
        isDeleted: false,
      },
    });
  }

  async getPlanById(id: number) {
    return await this.prisma.plan.findUnique({
      select: Selector.PLAN,
      where: {
        id,
      },
    });
  }
}
