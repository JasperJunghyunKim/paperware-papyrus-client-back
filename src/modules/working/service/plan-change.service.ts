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
  ) { }
  async startPlan(params: { planId: number }) {
    const { planId } = params;

    // const plan = await this.prisma.plan.findUnique({
    //   where: {
    //     id: planId,
    //   },
    //   select: {
    //     status: true,
    //   },
    // });

    // if (plan.status !== 'PREPARING') {
    //   throw new Error('이미 시작된 Plan 입니다.');
    // }

    // return await this.prisma.plan.update({
    //   where: {
    //     id: planId,
    //   },
    //   data: {
    //     status: 'PROGRESSING',
    //   },
    // });
  }

  async completePlan(params: { planId: number }) {
    const { planId } = params;

    // const plan = await this.prisma.plan.findUnique({
    //   where: {
    //     id: planId,
    //   },
    //   select: {
    //     status: true,
    //   },
    // });

    // if (plan.status !== 'PROGRESSING') {
    //   throw new Error('완료할 수 없는 Plan입니다.');
    // }

    // return await this.prisma.plan.update({
    //   where: {
    //     id: planId,
    //   },
    //   data: {
    //     status: 'PROGRESSED',
    //   },
    // });

    // TODO: 입고 가능한 Release 재고를 생성합니다.
  }

  async registerInputStock(params: {
    planId: number;
    stockId: number;
    quantity: number;
  }) {
    const { planId, stockId, quantity } = params;

    // await this.prisma.$transaction(async (tx) => {
    //   const plan = await tx.plan.findUnique({
    //     where: {
    //       id: planId,
    //     },
    //     select: {
    //       status: true,
    //       targetStockGroupEvent: true,
    //     },
    //   });

    //   if (plan.status !== 'PROGRESSING') {
    //     throw new Error('실투입 재고를 등록할 수 없는 상태의 작업 계획입니다.');
    //   }

    //   const se = await tx.stockEvent.create({
    //     data: {
    //       change: -quantity,
    //       stockId,
    //       status: 'NORMAL',
    //       planIn: {
    //         connect: {
    //           id: planId,
    //         },
    //       },
    //     },
    //   });

    //   // TODO... StockGroup 가용량 +해주어야함



    //   await this.stockChangeService.cacheStockQuantityTx(tx, {
    //     id: se.stockId,
    //   });
    // });
  }
}
