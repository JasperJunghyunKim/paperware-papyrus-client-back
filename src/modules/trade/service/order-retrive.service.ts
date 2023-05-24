import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class OrderRetriveService {
  constructor(private readonly prisma: PrismaService) {}

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
    companyId: number;
    skip?: number;
    take?: number;
    orderId: number;
  }): Promise<Model.ArrivalStockGroup[]> {
    const { orderId, companyId } = params;

    const items = await this.prisma.stockGroup.findMany({
      include: {
        stockGroupEvent: true,
        orderStock: {
          include: {
            order: {
              include: {
                srcCompany: true,
                dstCompany: true,
              },
            },
            product: {
              include: {
                paperDomain: true,
                manufacturer: true,
                paperGroup: true,
                paperType: true,
              },
            },
            packaging: true,
            paperColorGroup: true,
            paperColor: true,
            paperPattern: true,
            paperCert: true,
            dstLocation: {
              include: {
                company: true,
              },
            },
            warehouse: {
              include: {
                company: true,
              },
            },
            plan: true,
          },
        },
        product: {
          include: {
            paperDomain: true,
            manufacturer: true,
            paperGroup: true,
            paperType: true,
          },
        },
        packaging: true,
        paperColorGroup: true,
        paperColor: true,
        paperPattern: true,
        paperCert: true,
      },
      where: {
        companyId,
        orderStock: {
          orderId,
        },
        stockGroupEvent: {
          some: {
            status: {
              not: 'CANCELLED',
            },
          },
        },
      },
    });

    return items.map((item) => {
      const totalQuantity = item.stockGroupEvent.reduce((prev, cur) => {
        return prev + cur.change;
      }, 0);
      const storingQuantity = item.stockGroupEvent
        .filter((item) => item.change > 0)
        .reduce((prev, cur) => {
          return prev + cur.change;
        }, 0);

      const orderCompany =
        (item.orderStock?.order.srcCompany.id === companyId
          ? item.orderStock?.order.dstCompany
          : item.orderStock?.order.srcCompany) || null;

      return {
        id: item.id,
        company: null, // 도착예정재고 => 자신의 회사이므로 정보 필요X
        product: item.product,
        packaging: item.packaging,
        grammage: item.grammage,
        sizeX: item.sizeX,
        sizeY: item.sizeY,
        paperColorGroup: item.paperColorGroup,
        paperColor: item.paperColor,
        paperPattern: item.paperPattern,
        paperCert: item.paperCert,
        warehouse: null, // 도착예정재고 => 창고 null
        orderCompanyInfo: orderCompany,
        orderInfo: item.orderStock?.order
          ? {
              wantedDate: item.orderStock.order.wantedDate.toISOString(),
            }
          : null,
        orderStock: item.orderStock
          ? {
              id: item.orderStock.id,
              orderId: item.orderStock.orderId,
              dstLocation: item.orderStock.dstLocation,
              warehouse: item.orderStock.warehouse,
              product: item.orderStock.product,
              packaging: item.orderStock.packaging,
              grammage: item.orderStock.grammage,
              sizeX: item.orderStock.sizeX,
              sizeY: item.orderStock.sizeY,
              paperColorGroup: item.orderStock.paperColorGroup,
              paperColor: item.orderStock.paperColor,
              paperPattern: item.orderStock.paperPattern,
              paperCert: item.orderStock.paperCert,
              quantity: item.orderStock.quantity,
              plan: item.orderStock.plan
                ? {
                    id: item.orderStock.planId,
                    planNo: item.orderStock.plan.planNo,
                  }
                : null,
            }
          : null,
        totalQuantity,
        storingQuantity,
        nonStoringQuantity: totalQuantity - storingQuantity,
      };
    });
  }

  async getOrderStockArrivalCount(params: { orderId: number }) {
    const { orderId } = params;

    const count = await this.prisma.stockGroup.count({
      where: {
        orderStock: {
          orderId,
        },
        stockGroupEvent: {
          some: {
            status: {
              not: 'CANCELLED',
            },
          },
        },
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
