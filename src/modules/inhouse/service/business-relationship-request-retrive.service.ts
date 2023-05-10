import { Injectable } from '@nestjs/common';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class BusinessRelationshipRequestRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: { skip: number; take: number; dstCompanyId?: number }) {
    return await this.prisma.businessRelationshipRequest.findMany({
      select: Selector.BUSINESS_RELATIONSHIP_REQUEST,
      where: {
        dstCompanyId: params.dstCompanyId,
        status: 'PENDING',
      },
      skip: params.skip,
      take: params.take,
    });
  }

  async getCount(params: { dstCompanyId?: number }) {
    return await this.prisma.businessRelationshipRequest.count({
      where: {
        dstCompanyId: params.dstCompanyId,
        status: 'PENDING',
      },
    });
  }
}
