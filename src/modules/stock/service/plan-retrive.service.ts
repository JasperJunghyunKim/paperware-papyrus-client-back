import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class PlanRetrive {
  constructor(private prisma: PrismaService) { }

  async getAssignStockEventList(params: {
    orderId: number;
    skip?: number;
    take?: number;
  }): Promise<Model.StockEvent[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: params.orderId },
    });

    const orderStock = await this.prisma.orderStock.findUnique({
      where: { orderId: params.orderId },
      select: { id: true },
    });

    // 원지 정보는 판매자(dstCompany) 작업 계획 정보에 있음
    const dstPlan = await this.prisma.plan.findFirst({
      where: { orderStockId: orderStock.id, companyId: order.dstCompanyId },
    });

    const list = await this.prisma.stockEvent.findMany({
      where: {
        assignPlan: {
          every: {
            id: dstPlan.id,
          },
        },
      },
      skip: params.skip,
      take: params.take,
      select: Selector.STOCK_EVENT,
    });
    return Util.serialize(list);
  }
}
