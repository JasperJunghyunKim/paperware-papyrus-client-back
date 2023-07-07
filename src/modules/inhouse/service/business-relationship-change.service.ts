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

  async register(params: {
    srcCompanyId: number;
    create: boolean;
    type: 'PURCHASE' | 'SALES' | 'BOTH';
    companyRegistrationNumber: string;
    partnerNickname: string;
    creditLimit: number;
    businessName: string;
    invoiceCode: string;
    bizType: string;
    bizItem: string;
    address: string;
    phoneNo: string;
    faxNo: string;
    representative: string;
    memo: string;
  }) {
    await this.prisma.$transaction(async (tx) => {
      // 파트너 정보 업데이트
      await tx.partner.upsert({
        where: {
          companyId_companyRegistrationNumber: {
            companyId: params.srcCompanyId,
            companyRegistrationNumber: params.companyRegistrationNumber,
          },
        },
        create: {
          companyId: params.srcCompanyId,
          companyRegistrationNumber: params.companyRegistrationNumber,
          partnerNickName: params.partnerNickname,
          creditLimit: params.creditLimit,
          memo: params.memo,
        },
        update: {
          partnerNickName: params.partnerNickname,
          creditLimit: params.creditLimit,
          memo: params.memo,
        },
      });

      const targetCompany = await tx.company.findFirst({
        select: {
          id: true,
          managedBy: true,
        },
        where: {
          companyRegistrationNumber: params.companyRegistrationNumber,
          managedById: null,
        },
      });

      const isPurchase = params.type === 'PURCHASE' || params.type === 'BOTH';
      const isSales = params.type === 'SALES' || params.type === 'BOTH';

      if (targetCompany && !params.create) {
        // 거래처 등록 요청 등록
        await tx.businessRelationshipRequest.upsert({
          create: {
            srcCompanyId: params.srcCompanyId,
            dstCompanyId: targetCompany.id,
            isPurchase,
            isSales,
            status: 'PENDING',
            memo: '',
          },
          update: {
            isPurchase,
            isSales,
            status: 'PENDING',
            memo: '',
          },
          where: {
            srcCompanyId_dstCompanyId: {
              srcCompanyId: params.srcCompanyId,
              dstCompanyId: targetCompany.id,
            },
          },
        });
      } else {
        const company = await tx.company.create({
          data: {
            companyRegistrationNumber: params.companyRegistrationNumber,
            businessName: params.businessName,
            invoiceCode: params.invoiceCode,
            bizType: params.bizType,
            bizItem: params.bizItem,
            address: params.address,
            phoneNo: params.phoneNo,
            faxNo: params.faxNo,
            representative: params.representative,
            managedById: params.srcCompanyId,
          },
        });
        if (isSales) {
          await tx.businessRelationship.create({
            data: {
              srcCompanyId: params.srcCompanyId,
              dstCompanyId: company.id,
            },
          });
        }
        if (isPurchase) {
          await tx.businessRelationship.create({
            data: {
              srcCompanyId: company.id,
              dstCompanyId: params.srcCompanyId,
            },
          });
        }
      }
    });
  }

  async upsertPartner(params: {
    companyId: number;
    companyRegistrationNumber: string;
    partnerNickname: string;
    creditLimit: number;
    memo: string;
  }) {
    await this.prisma.$transaction(async (tx) => {
      await tx.partner.upsert({
        where: {
          companyId_companyRegistrationNumber: {
            companyId: params.companyId,
            companyRegistrationNumber: params.companyRegistrationNumber,
          },
        },
        create: {
          companyId: params.companyId,
          companyRegistrationNumber: params.companyRegistrationNumber,
          partnerNickName: params.partnerNickname,
          creditLimit: params.creditLimit,
          memo: params.memo,
        },
        update: {
          partnerNickName: params.partnerNickname,
          creditLimit: params.creditLimit,
          memo: params.memo,
        },
      });
    });
  }

  async request(params: {
    companyId: number;
    targetCompanyId: number;
    type: 'PURCHASE' | 'SALES' | 'BOTH' | 'NONE';
  }) {
    await this.prisma.$transaction(async (tx) => {
      const targetCompany = await tx.company.findFirst({
        select: {
          id: true,
          managedBy: true,
        },
        where: {
          id: params.targetCompanyId,
        },
      });

      const prevPurchase = await tx.businessRelationship.findFirst({
        where: {
          srcCompanyId: targetCompany.id,
          dstCompanyId: params.companyId,
          isActivated: true,
        },
      });

      const prevSales = await tx.businessRelationship.findFirst({
        where: {
          srcCompanyId: params.companyId,
          dstCompanyId: targetCompany.id,
          isActivated: true,
        },
      });

      const lastType =
        prevPurchase && prevSales
          ? 'BOTH'
          : prevPurchase
          ? 'PURCHASE'
          : prevSales
          ? 'SALES'
          : 'NONE';

      const isPurchase = params.type === 'PURCHASE' || params.type === 'BOTH';
      const isSales = params.type === 'SALES' || params.type === 'BOTH';

      if (
        targetCompany.managedBy === null &&
        lastType !== 'BOTH' &&
        params.type !== 'NONE' &&
        lastType !== params.type
      ) {
        await tx.businessRelationshipRequest.upsert({
          create: {
            srcCompanyId: params.companyId,
            dstCompanyId: targetCompany.id,
            isPurchase,
            isSales,
            status: 'PENDING',
            memo: '',
          },
          update: {
            isPurchase,
            isSales,
            status: 'PENDING',
            memo: '',
          },
          where: {
            srcCompanyId_dstCompanyId: {
              srcCompanyId: params.companyId,
              dstCompanyId: targetCompany.id,
            },
          },
        });
      } else {
        await tx.businessRelationship.upsert({
          create: {
            srcCompanyId: params.companyId,
            dstCompanyId: targetCompany.id,
            isActivated: isSales,
          },
          update: {
            isActivated: isSales,
          },
          where: {
            srcCompanyId_dstCompanyId: {
              srcCompanyId: params.companyId,
              dstCompanyId: targetCompany.id,
            },
          },
        });
        await tx.businessRelationship.upsert({
          create: {
            srcCompanyId: targetCompany.id,
            dstCompanyId: params.companyId,
            isActivated: isPurchase,
          },
          update: {
            isActivated: isPurchase,
          },
          where: {
            srcCompanyId_dstCompanyId: {
              srcCompanyId: targetCompany.id,
              dstCompanyId: params.companyId,
            },
          },
        });
      }
    });
  }

  async deactive(params: { srcCompanyId: number; dstCompanyId: number }) {
    await this.prisma.businessRelationship.updateMany({
      where: {
        srcCompanyId: params.srcCompanyId,
        dstCompanyId: params.dstCompanyId,
      },
      data: {
        isActivated: false,
      },
    });
  }
}
