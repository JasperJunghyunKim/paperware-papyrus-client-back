import { Injectable } from '@nestjs/common';
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
    return await this.prisma.orderRequestItem.findMany({
      where: {
        orderRequest: {
          srcCompanyId: params.srcCompanyId ? params.srcCompanyId : undefined,
          dstCompanyId: params.dstCompanyId ? params.dstCompanyId : undefined,
        },
      },
      skip: params.skip,
      take: params.take,
    });
  }
}
