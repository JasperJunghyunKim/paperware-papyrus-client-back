import { Injectable } from '@nestjs/common';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class BusinessRelationshipRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip: number;
    take: number;
    srcCompanyId?: number;
    dstCompanyId?: number;
  }) {
    return await this.prisma.businessRelationship.findMany({
      select: Selector.BUSINESS_RELATIONSHIP,
      where: {
        srcCompanyId: params.srcCompanyId,
        dstCompanyId: params.dstCompanyId,
      },
      skip: params.skip,
      take: params.take,
    });
  }

  async getCount(params: {
    srcCompanyId?: number;
    dstCompanyId?: number;
  }): Promise<number> {
    return await this.prisma.businessRelationship.count({
      where: {
        srcCompanyId: params.srcCompanyId,
        dstCompanyId: params.dstCompanyId,
      },
    });
  }

  async getItem(params: { srcCompanyId: number; dstCompanyId: number }) {
    return await this.prisma.businessRelationship.findUnique({
      select: Selector.BUSINESS_RELATIONSHIP,
      where: {
        srcCompanyId_dstCompanyId: {
          srcCompanyId: params.srcCompanyId,
          dstCompanyId: params.dstCompanyId,
        },
      },
    });
  }
}
