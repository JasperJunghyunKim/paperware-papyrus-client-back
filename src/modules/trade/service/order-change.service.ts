import { Injectable } from '@nestjs/common';
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
    stockGroupId: number;
    quantity: number;
    memo: string;
    wantedDate: string;
    isOffer: boolean;
  }) {
    const {
      srcCompanyId,
      dstCompanyId,
      locationId,
      stockGroupId,
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
            stockGroupId,
            quantity,
          },
        },
      },
    });
  }
}
