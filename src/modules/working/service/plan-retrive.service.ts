import { Injectable } from '@nestjs/common';
import { StockEvent } from 'src/@shared/models';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class PlanRetriveService {
  constructor(private prisma: PrismaService) {}

  async getPlanList(params: {
    companyId: number;
    type?: 'INHOUSE' | 'DEFAULT';
    skip?: number;
    take?: number;
  }) {
    const { skip, take } = params;
    const type = params.type ?? 'DEFAULT';

    return await this.prisma.plan.findMany({
      select: Selector.PLAN,
      where: {
        companyId: params.companyId,
        status: {
          notIn:
            type === 'INHOUSE' ? ['CANCELLED'] : ['CANCELLED', 'PREPARING'],
        },
        type: {
          in: type === 'INHOUSE' ? ['INHOUSE_PROCESS'] : undefined,
        },
      },
      skip,
      take,
    });
  }

  async getPlanListCount(params: { companyId: number }) {
    return await this.prisma.plan.count({
      where: {
        companyId: params.companyId,
        status: {
          notIn: ['CANCELLED', 'PREPARING'],
        },
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
        plan: {
          id: planId,
        },
      },
      skip,
      take,
      orderBy: {
        id: 'desc',
      },
    });

    return planInput.map(Util.serialize);
  }

  async getPlanInputCount(params: { planId: number }) {
    const { planId } = params;

    const count = await this.prisma.stockEvent.count({
      where: {
        plan: {
          id: planId,
        },
      },
    });

    return count;
  }
}
