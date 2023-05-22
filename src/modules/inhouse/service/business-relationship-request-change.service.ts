import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class BusinessRelationshipRequestChangeService {
  constructor(private prisma: PrismaService) {}

  async upsert(params: {
    srcCompanyId: number;
    dstCompanyId: number;
    isSales: boolean;
    isPurchase: boolean;
  }) {
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
        isPurchase: params.isPurchase,
        isSales: params.isSales,
        memo: '',
      },
      update: {
        status: 'PENDING',
      },
    });
  }

  async accept(params: { srcCompanyId: number; dstCompanyId: number }) {
    await this.prisma.$transaction(async (tx) => {
      const request = await tx.businessRelationshipRequest.findUnique({
        where: {
          srcCompanyId_dstCompanyId: {
            srcCompanyId: params.srcCompanyId,
            dstCompanyId: params.dstCompanyId,
          },
        },
      });

      if (request.isPurchase) {
        await tx.businessRelationship.upsert({
          where: {
            srcCompanyId_dstCompanyId: {
              srcCompanyId: params.dstCompanyId,
              dstCompanyId: params.srcCompanyId,
            },
          },
          create: {
            srcCompanyId: params.dstCompanyId,
            dstCompanyId: params.srcCompanyId,
            isActivated: true,
          },
          update: {
            isActivated: true,
          },
        });
      }

      if (request.isSales) {
        await tx.businessRelationship.upsert({
          where: {
            srcCompanyId_dstCompanyId: {
              srcCompanyId: params.srcCompanyId,
              dstCompanyId: params.dstCompanyId,
            },
          },
          create: {
            srcCompanyId: params.srcCompanyId,
            dstCompanyId: params.dstCompanyId,
            isActivated: true,
          },
          update: {
            isActivated: true,
          },
        });
      }

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
