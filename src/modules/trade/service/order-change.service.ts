import { Injectable } from '@nestjs/common';
import { StockCreateStockPriceRequest } from 'src/@shared/api';
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

      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
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

      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
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

      if (
        !Util.inc(
          order.status,
          'OFFER_REQUESTED',
          'ORDER_REQUESTED',
          'OFFER_PREPARING',
          'ORDER_PREPARING',
        )
      ) {
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

      if (!Util.inc(order.status, 'OFFER_REQUESTED', 'ORDER_REQUESTED')) {
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

  async reset(params: { orderId: number }) {
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

      if (!Util.inc(order.status, 'OFFER_REQUESTED', 'ORDER_REQUESTED')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_REQUESTED'
              ? 'OFFER_PREPARING'
              : 'ORDER_PREPARING',
        },
      });
    });
  }

  async createArrival(params: {
    orderId: number;
    warehouseId: number | null;
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
    stockPrice: StockCreateStockPriceRequest;
  }) {
    const {
      orderId,
      warehouseId,
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
      stockPrice,
    } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          srcCompanyId: true,
        },
      });

      // TODO: 상테 체크

      await tx.stock.create({
        data: {
          company: {
            connect: {
              id: order.srcCompanyId,
            },
          },
          serial: ulid(),
          warehouse: warehouseId ? { connect: { id: warehouseId } } : undefined,
          product: { connect: { id: productId } },
          packaging: { connect: { id: packagingId } },
          grammage,
          sizeX,
          sizeY,
          paperColorGroup: paperColorGroupId
            ? { connect: { id: paperColorGroupId } }
            : undefined,
          paperColor: paperColorId
            ? { connect: { id: paperColorId } }
            : undefined,
          paperPattern: paperPatternId
            ? { connect: { id: paperPatternId } }
            : undefined,
          paperCert: paperCertId ? { connect: { id: paperCertId } } : undefined,
          stockPrice: {
            create: {
              officialPriceType: stockPrice.officialPriceType,
              officialPrice: stockPrice.officialPrice,
              officialPriceUnit: stockPrice.officialPriceUnit,
              discountType: stockPrice.discountType,
              discountPrice: stockPrice.discountPrice,
              unitPrice: stockPrice.unitPrice,
              unitPriceUnit: stockPrice.unitPriceUnit,
            },
          },
          stockEvent: {
            create: {
              change: quantity,
              status: 'PENDING',
              orderStockArrival: {
                connect: {
                  orderId,
                },
              },
            },
          },
        },
      });
    });
  }
}