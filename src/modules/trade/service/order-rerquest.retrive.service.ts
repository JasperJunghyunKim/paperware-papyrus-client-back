import { Injectable } from '@nestjs/common';
import { Util } from 'src/common';
import { ORDER_REQUEST_ITEM_WITH_ORDER_REQUEST } from 'src/common/selector';
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
}
