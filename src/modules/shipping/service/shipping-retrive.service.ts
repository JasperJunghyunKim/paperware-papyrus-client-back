import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class ShippingRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip?: number;
    take?: number;
    companyId?: number;
  }): Promise<Model.Shipping[]> {
    const { companyId } = params;

    const shippings = await this.prisma.shipping.findMany({
      where: {
        companyId: companyId,
      },
      skip: params.skip,
      take: params.take,
      select: Selector.SHIPPING,
    });

    return shippings;
  }

  async getCount(params: { companyId?: number }): Promise<number> {
    const { companyId } = params;

    const count = await this.prisma.shipping.count({
      where: {
        companyId: companyId,
      },
    });

    return count;
  }
}
