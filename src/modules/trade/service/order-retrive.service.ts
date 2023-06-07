import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import _ from 'lodash';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { ORDER_DEPOSIT } from 'src/common/selector';
import { PrismaService } from 'src/core';

@Injectable()
export class OrderRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getList(params: {
    skip?: number;
    take?: number;
    srcCompanyId?: number;
    dstCompanyId?: number;
    status: OrderStatus[];
  }): Promise<Model.Order[]> {
    const { srcCompanyId, dstCompanyId } = params;

    const orders = await this.prisma.order.findMany({
      select: {
        ...Selector.ORDER,
        orderDeposit: {
          select: ORDER_DEPOSIT,
        },
      },
      where: {
        srcCompanyId: srcCompanyId,
        dstCompanyId: dstCompanyId,
        status: {
          in: params.status,
        },
      },
      skip: params.skip,
      take: params.take,
      orderBy: {
        id: 'desc',
      },
    });

    return orders.map(Util.serialize);
  }

  async getCount(params: {
    srcCompanyId?: number;
    dstCompanyId?: number;
  }): Promise<number> {
    const { srcCompanyId, dstCompanyId } = params;

    const count = await this.prisma.order.count({
      where: {
        OR: [
          {
            srcCompanyId,
          },
          {
            dstCompanyId,
          },
        ],
      },
    });

    return count;
  }

  async getItem(params: { orderId: number }): Promise<Model.Order | null> {
    const { orderId } = params;

    const order = await this.prisma.order.findUnique({
      select: Selector.ORDER,
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return null;
    }

    return Util.serialize(order);
  }

  /** 원지 가져오기 */
  async getAssignStockEvent(params: {
    orderId: number;
  }): Promise<Model.StockEvent> {
    const order = await this.prisma.order.findUnique({
      where: { id: params.orderId },
    });

    const orderStock = await this.prisma.orderStock.findUnique({
      where: { orderId: params.orderId },
      select: { id: true },
    });

    // 원지 정보는 판매자(dstCompany) 작업 계획에 있음
    const dstPlan = await this.prisma.plan.findFirst({
      where: { orderStockId: orderStock.id, companyId: order.dstCompanyId },
      select: {
        assignStockEvent: {
          select: Selector.STOCK_EVENT,
        },
      },
    });

    return dstPlan.assignStockEvent;
  }

  /** 도착 목록 가져오기 */
  async getArrivalStockList(params: {
    orderId: number;
    skip?: number;
    take?: number;
  }): Promise<Model.Stock[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: params.orderId },
    });

    const orderStock = await this.prisma.orderStock.findUnique({
      where: { orderId: params.orderId },
      select: { id: true },
    });

    // 도착 정보는 구매자(srcCompany) 작업 계획에 있음
    const srcPlan = await this.prisma.plan.findFirst({
      where: { orderStockId: orderStock.id, companyId: order.srcCompanyId },
      select: {
        id: true,
      },
    });

    const list = await this.prisma.stock.findMany({
      where: {
        planId: srcPlan.id,
      },
      select: Selector.STOCK,
      skip: params.skip,
      take: params.take,
    });

    return list;
  }

  /** 도착 목록 수 가져오기 */
  async getArrivalStockCount(params: { orderId: number }): Promise<number> {
    const order = await this.prisma.order.findUnique({
      where: { id: params.orderId },
    });

    const orderStock = await this.prisma.orderStock.findUnique({
      where: { orderId: params.orderId },
      select: { id: true },
    });

    // 도착 정보는 구매자(srcCompany) 작업 계획에 있음
    const srcPlan = await this.prisma.plan.findFirst({
      where: { orderStockId: orderStock.id, companyId: order.srcCompanyId },
      select: {
        id: true,
      },
    });

    return await this.prisma.stock.count({
      where: { planId: srcPlan.id },
    });
  }

  /** 거래금액 조회 */
  async getTradePrice(companyId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      include: {
        tradePrice: {
          include: {
            orderStockTradePrice: {
              include: {
                orderStockTradeAltBundle: true,
              },
            },
          },
        },
      },
      where: {
        id: orderId,
        OR: [{ srcCompanyId: companyId }, { dstCompanyId: companyId }],
      },
    });
    if (!order) throw new NotFoundException('존재하지 않는 주문'); // 모듈 이동시 Exception 생성하여 처리

    const tradePrice =
      order.tradePrice.find((tp) => tp.companyId === companyId) || null;

    return tradePrice;
  }
}
