import { Injectable, NotFoundException } from '@nestjs/common';
import { StockEvent } from 'src/@shared/models';
import { Selector, Util } from 'src/common';
import { STOCK } from 'src/common/selector';
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
      select: {
        ...Selector.PLAN,
        task: {
          select: {
            status: true,
            type: true,
          },
        },
      },
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
        status: 'NORMAL',
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
        status: 'NORMAL',
      },
    });

    return count;
  }

  async getInputStock(companyId: number, planId: number, stockId: number) {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: planId,
      },
      select: {
        status: true,
        type: true,
        companyId: true,
        targetStockEvent: {
          where: {
            stockId,
            status: 'NORMAL',
          },
          select: {
            stockId: true,
            change: true,
            useRemainder: true,
            stock: {
              select: STOCK,
            },
          },
        },
      },
    });

    if (plan.companyId !== companyId || plan.targetStockEvent.length === 0)
      throw new NotFoundException(`실투입 재고가 존재하지 않습니다.`);

    return {
      stockId: plan.targetStockEvent[0].stockId,
      quantity: Math.abs(plan.targetStockEvent[0].change),
      useRemainder: plan.targetStockEvent[0].useRemainder,
      stock: plan.targetStockEvent[0].stock,
    };
  }
}
