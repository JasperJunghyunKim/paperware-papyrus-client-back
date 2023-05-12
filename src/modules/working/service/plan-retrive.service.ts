import { Injectable } from '@nestjs/common';
import { StockEvent } from 'src/@shared/models';
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

  async getPlanInputList(params: {
    planId: number;
    skip?: number;
    take?: number;
  }): Promise<StockEvent[]> {
    const { planId, skip, take } = params;

    const planInput = await this.prisma.stockEvent.findMany({
      select: Selector.STOCK_EVENT,
      where: {
        planIn: {
          some: {
            id: planId,
          },
        },
      },
      skip,
      take,
      orderBy: {
        id: 'desc',
      },
    });

    return planInput;
  }

  async getPlanInputCount(params: { planId: number }) {
    const { planId } = params;

    const count = await this.prisma.stockEvent.count({
      where: {
        planIn: {
          some: {
            id: planId,
          },
        },
      },
    });

    return count;
  }
}
