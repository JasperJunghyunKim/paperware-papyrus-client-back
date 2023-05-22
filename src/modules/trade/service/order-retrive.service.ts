import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
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
      select: Selector.ORDER,
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

    return orders.map((order) => ({
      ...order,
      wantedDate: Util.dateToIso8601(order.wantedDate),
    }));
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

    const a: Model.Order = {
      ...order,
      wantedDate: Util.dateToIso8601(order.wantedDate),
    };

    return {
      ...order,
      wantedDate: Util.dateToIso8601(order.wantedDate),
    };
  }

  async getOrderStockArrivalList(params: {
    skip?: number;
    take?: number;
    orderId: number;
  }): Promise<Model.StockGroupEvent[]> {
    const { orderId } = params;

    const stockGroupEvent = await this.prisma.stockGroupEvent.findMany({
      select: Selector.STOCK_GROUP_EVENT,
      where: {
        status: {
          not: 'CANCELLED'
        },
        stockGroup: {
          orderStock: {
            orderId,
          }
        }
      },
    });

    return stockGroupEvent.map(sge => ({
      ...sge
    }));
  }

  async getOrderStockArrivalCount(params: { orderId: number }) {
    const { orderId } = params;

    const count = await this.prisma.stockGroupEvent.count({
      where: {
        status: {
          not: 'CANCELLED',
        },
        stockGroup: {
          orderStock: {
            orderId,
          }
        }
      },
    });

    return count;
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
