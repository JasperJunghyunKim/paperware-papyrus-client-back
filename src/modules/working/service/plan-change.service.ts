import { Injectable } from '@nestjs/common';
import { PrismaTransaction } from 'src/common/types';
import { PrismaService } from 'src/core';
import { StockChangeService } from 'src/modules/stock/service/stock-change.service';
import { ulid } from 'ulid';

@Injectable()
export class PlanChangeService {
  constructor(
    private prisma: PrismaService,
    private stockChangeService: StockChangeService,
  ) {}
  async startPlan(params: { planId: number }) {
    const { planId } = params;

    const plan = await this.prisma.plan.findUnique({
      where: {
        id: planId,
      },
      select: {
        status: true,
      },
    });

    if (plan.status !== 'PREPARING') {
      throw new Error('이미 시작된 Plan 입니다.');
    }

    return await this.prisma.plan.update({
      where: {
        id: planId,
      },
      data: {
        status: 'PROGRESSING',
      },
    });
  }

  async registerInputStock(params: {
    planId: number;
    stockId: number;
    quantity: number;
  }) {
    const { planId, stockId, quantity } = params;

    await this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: {
          id: planId,
        },
        select: {
          status: true,
          targetStockEvent: true,
        },
      });

      if (plan.status !== 'PROGRESSING') {
        throw new Error('진행중인 작업계획에서만 재고를 입력할 수 있습니다.');
      }

      const se = await tx.stockEvent.create({
        data: {
          change: -quantity,
          stockId,
          status: 'NORMAL',
          plan: {
            connect: {
              id: planId,
            },
          },
        },
      });

      await this.stockChangeService.cacheStockQuantityTx(tx, {
        id: se.stockId,
      });
    });
  }
}
