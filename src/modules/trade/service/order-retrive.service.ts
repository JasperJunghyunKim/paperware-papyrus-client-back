import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import _ from 'lodash';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import {
  COMPANY,
  DEPOSIT,
  LOCATION,
  ORDER_DEPOSIT,
  ORDER_PROCESS,
  PACKAGING,
  PAPER_CERT,
  PAPER_COLOR,
  PAPER_COLOR_GROUP,
  PAPER_PATTERN,
  PRODUCT,
  STOCK_EVENT,
  WAREHOUSE,
} from 'src/common/selector';
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
      select: {
        ...Selector.ORDER,
        orderDeposit: {
          select: ORDER_DEPOSIT,
        },
        srcDepositEvent: {
          include: {
            deposit: {
              select: DEPOSIT,
            },
          },
        },
        dstDepositEvent: {
          include: {
            deposit: {
              select: DEPOSIT,
            },
          },
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

    return Util.serialize(dstPlan.assignStockEvent);
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
            orderDepositTradePrice: {
              include: {
                orderDepositTradeAltBundle: true,
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

  async getOrderDeposit(companyId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      include: {
        srcDepositEvent: {
          include: {
            deposit: {
              select: DEPOSIT,
            },
          },
        },
        dstDepositEvent: {
          include: {
            deposit: {
              select: DEPOSIT,
            },
          },
        },
      },
      where: {
        id: orderId,
      },
    });
    if (
      !order ||
      (order.srcCompanyId !== companyId && order.dstCompanyId !== companyId)
    )
      throw new NotFoundException(`존재하지 않는 주문입니다.`);

    const depositEvent =
      order.srcCompanyId === companyId
        ? order.srcDepositEvent
        : order.dstDepositEvent;
    return depositEvent;
  }

  async getOrderProcess(
    companyId: number,
    orderId: number,
  ): Promise<Model.OrderProcess> {
    const orderProcess = await this.prisma.orderProcess.findFirst({
      select: {
        id: true,
        srcLocation: {
          select: LOCATION,
        },
        dstLocation: {
          select: LOCATION,
        },
        order: {
          select: {
            id: true,
            orderNo: true,
            orderType: true,
            status: true,
            isEntrusted: true,
            memo: true,
            srcCompanyId: true,
            dstCompanyId: true,
          },
        },
        isDstDirectShipping: true,
        isSrcDirectShipping: true,
        srcWantedDate: true,
        dstWantedDate: true,
        plan: {
          select: {
            id: true,
            planNo: true,
            type: true,
            status: true,
            assignStockEvent: {
              select: STOCK_EVENT,
            },
            targetStockEvent: {
              select: STOCK_EVENT,
            },
            companyId: true,
          },
        },
        // 외주공정의 주문 원지 정보
        company: {
          select: COMPANY,
        },
        planId: true,
        warehouse: {
          select: WAREHOUSE,
        },
        product: {
          select: PRODUCT,
        },
        packaging: {
          select: PACKAGING,
        },
        grammage: true,
        sizeX: true,
        sizeY: true,
        paperColorGroup: {
          select: PAPER_COLOR_GROUP,
        },
        paperColor: {
          select: PAPER_COLOR,
        },
        paperPattern: {
          select: PAPER_PATTERN,
        },
        paperCert: {
          select: PAPER_CERT,
        },
        quantity: true,
      },
      where: {
        orderId,
      },
    });

    if (
      !orderProcess ||
      (orderProcess.order.srcCompanyId !== companyId &&
        orderProcess.order.dstCompanyId !== companyId)
    )
      throw new NotFoundException(`존재하지 않는 외주공정 주문입니다.`);

    return Util.serialize(orderProcess);
  }

  async getOrderEtc(
    companyId: number,
    orderId: number,
  ): Promise<Model.OrderEtc> {
    const item = await this.prisma.orderEtc.findFirst({
      select: {
        id: true,
        order: {
          select: {
            id: true,
            orderNo: true,
            orderType: true,
            status: true,
            isEntrusted: true,
            memo: true,
          },
        },
        item: true,
      },
      where: {
        orderId,
      },
    });

    return item;
  }

  async getNotUsingInvoiceCode(): Promise<string> {
    const invoice = await this.prisma.tempInvoiceCode.findFirst();
    return invoice.invoiceCode + String(invoice.number);
  }
}
