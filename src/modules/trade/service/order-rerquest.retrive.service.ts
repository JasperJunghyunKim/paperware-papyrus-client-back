import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Util } from 'src/common';
import {
  ORDER_REQUEST,
  ORDER_REQUEST_ITEM_WITH_ORDER_REQUEST,
} from 'src/common/selector';
import { PrismaService } from 'src/core';

@Injectable()
export class OrderRequestRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(params: {
    skip: number;
    take: number;
    srcCompanyId: number | null;
    dstCompanyId: number | null;
  }) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.orderRequestItem.findMany({
        select: ORDER_REQUEST_ITEM_WITH_ORDER_REQUEST,
        where: {
          orderRequest: {
            srcCompanyId: params.srcCompanyId ? params.srcCompanyId : undefined,
            dstCompanyId: params.dstCompanyId ? params.dstCompanyId : undefined,
          },
        },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.orderRequestItem.count({
        where: {
          orderRequest: {
            srcCompanyId: params.srcCompanyId ? params.srcCompanyId : undefined,
            dstCompanyId: params.dstCompanyId ? params.dstCompanyId : undefined,
          },
        },
      }),
    ]);

    return {
      items: items.map((item) => Util.serialize(item)),
      total,
    };
  }

  async get(
    companyId: number,
    orderRequestId: number,
  ): Promise<Model.OrderRequest> {
    const req = await this.prisma.orderRequest.findUnique({
      select: ORDER_REQUEST,
      where: {
        id: orderRequestId,
      },
    });
    if (
      !req ||
      (req.srcCompany.id !== companyId && req.dstCompany.id !== companyId)
    )
      throw new NotFoundException(`존재하지 않는 퀵주문 입니다.`);

    return Util.serialize(req);
  }
}
