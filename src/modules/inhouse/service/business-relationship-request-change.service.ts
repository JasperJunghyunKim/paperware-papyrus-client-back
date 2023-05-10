import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class BusinessRelationshipRequestChangeService {
  constructor(private prisma: PrismaService) {}

  async upsert(params: { srcCompanyId: number; dstCompanyId: number }) {
    await this.prisma.businessRelationshipRequest.upsert({
      where: {
        srcCompanyId_dstCompanyId: {
          srcCompanyId: params.srcCompanyId,
          dstCompanyId: params.dstCompanyId,
        },
      },
      create: {
        srcCompanyId: params.srcCompanyId,
        dstCompanyId: params.dstCompanyId,
        status: 'PENDING',
        memo: '',
      },
      update: {
        status: 'PENDING',
      },
    });
  }

  async accept(params: { srcCompanyId: number; dstCompanyId: number }) {
    await this.prisma.$transaction(async (tx) => {
      await tx.businessRelationship.create({
        data: {
          srcCompanyId: params.dstCompanyId,
          dstCompanyId: params.srcCompanyId,
        },
      });

      await tx.businessRelationshipRequest.update({
        where: {
          srcCompanyId_dstCompanyId: {
            srcCompanyId: params.srcCompanyId,
            dstCompanyId: params.dstCompanyId,
          },
        },
        data: {
          status: 'ACCEPTED',
        },
      });
    });
  }

  async reject(params: { srcCompanyId: number; dstCompanyId: number }) {
    await this.prisma.businessRelationshipRequest.update({
      where: {
        srcCompanyId_dstCompanyId: {
          srcCompanyId: params.srcCompanyId,
          dstCompanyId: params.dstCompanyId,
        },
      },
      data: {
        status: 'REJECTED',
      },
    });
  }
}
