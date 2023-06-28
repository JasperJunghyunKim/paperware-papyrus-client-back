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
        select: {
          isPurchase: true,
          isSales: true,
          srcCompany: true,
          dstCompany: true,
        },
      });

      console.log(':::', request);

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
          isActivated: request.isPurchase,
        },
        update: {
          isActivated: request.isPurchase,
        },
      });

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
          isActivated: request.isSales,
        },
        update: {
          isActivated: request.isSales,
        },
      });

      const srcPartner = await tx.partner.findUnique({
        where: {
          companyId_companyRegistrationNumber: {
            companyId: params.srcCompanyId,
            companyRegistrationNumber:
              request.dstCompany.companyRegistrationNumber,
          },
        },
      });

      if (!srcPartner) {
        await tx.partner.create({
          data: {
            companyId: params.srcCompanyId,
            companyRegistrationNumber:
              request.dstCompany.companyRegistrationNumber,
            partnerNickName: request.dstCompany.businessName,
            memo: '',
          },
        });
      }

      const dstPartner = await tx.partner.findUnique({
        where: {
          companyId_companyRegistrationNumber: {
            companyId: params.dstCompanyId,
            companyRegistrationNumber:
              request.srcCompany.companyRegistrationNumber,
          },
        },
      });

      if (!dstPartner) {
        await tx.partner.create({
          data: {
            companyId: params.dstCompanyId,
            companyRegistrationNumber:
              request.srcCompany.companyRegistrationNumber,
            partnerNickName: request.srcCompany.businessName,
            memo: '',
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
