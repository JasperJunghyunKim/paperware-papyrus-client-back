import { Injectable } from '@nestjs/common';
import { Util } from 'src/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class OrderChangeService {
  constructor(private readonly prisma: PrismaService) {}

  /** 정상거래 주문 생성 */
  async createStockOrder(params: {
    srcCompanyId: number;
    dstCompanyId: number;
    locationId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    memo: string;
    wantedDate: string;
    isOffer: boolean;
  }) {
    const {
      srcCompanyId,
      dstCompanyId,
      locationId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      quantity,
      memo,
      wantedDate,
    } = params;

    const isEntrusted =
      !!(
        await this.prisma.company.findUnique({
          where: {
            id: srcCompanyId,
          },
          select: {
            managedById: true,
          },
        })
      ).managedById ||
      !!(
        await this.prisma.company.findUnique({
          where: {
            id: dstCompanyId,
          },
          select: {
            managedById: true,
          },
        })
      ).managedById;

    await this.prisma.order.create({
      data: {
        orderNo: ulid(),
        srcCompany: {
          connect: {
            id: srcCompanyId,
          },
        },
        dstCompany: {
          connect: {
            id: dstCompanyId,
          },
        },
        status: params.isOffer ? 'OFFER_PREPARING' : 'ORDER_PREPARING',
        isEntrusted,
        memo,
        wantedDate,
        orderStock: {
          create: {
            dstLocationId: locationId,
            productId,
            packagingId,
            grammage,
            sizeX,
            sizeY,
            paperColorGroupId,
            paperColorId,
            paperPatternId,
            paperCertId,
            quantity,
          },
        },
      },
    });
  }

  async updateStockOrder(params: {
    orderId: number;
    locationId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    memo: string;
    wantedDate: string;
  }) {
    const {
      orderId,
      locationId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      quantity,
      memo,
      wantedDate,
    } = params;

    await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        memo,
        wantedDate,
        orderStock: {
          update: {
            dstLocationId: locationId,
            productId,
            packagingId,
            grammage,
            sizeX,
            sizeY,
            paperColorGroupId,
            paperColorId,
            paperPatternId,
            paperCertId,
            quantity,
          },
        },
      },
    });
  }

  async request(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_PREPARING'
              ? 'OFFER_REQUESTED'
              : 'ORDER_REQUESTED',
        },
      });
    });
  }

  async cancel(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_PREPARING'
              ? 'OFFER_CANCELLED'
              : 'ORDER_CANCELLED',
        },
      });
    });
  }

  async accept(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (Util.inc(order.status, 'OFFER_REQUESTED', 'ORDER_REQUESTED')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: 'ACCEPTED',
        },
      });
    });
  }

  async reject(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (Util.inc(order.status, 'OFFER_REQUESTED', 'ORDER_REQUESTED')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_REQUESTED'
              ? 'OFFER_REJECTED'
              : 'ORDER_REJECTED',
        },
      });
    });
  }
}
