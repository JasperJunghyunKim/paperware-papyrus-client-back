import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class BusinessRelationshipChangeService {
  constructor(private prisma: PrismaService) {}

  async create(params: { srcCompanyId: number; dstCompanyId: number }) {
    await this.prisma.businessRelationship.create({
      data: {
        srcCompanyId: params.srcCompanyId,
        dstCompanyId: params.dstCompanyId,
      },
    });
  }
}
