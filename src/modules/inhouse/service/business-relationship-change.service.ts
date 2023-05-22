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
    invoiceCode: string;
    address: string;
    phoneNo: string;
    faxNo: string;
    email: string;
    memo: string;
  }) {
    this.prisma.$transaction(async (tx) => {
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
          memo: params.memo,
        },
        update: {
          partnerNickName: params.partnerNickname,
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
            businessName: params.partnerNickname,
            invoiceCode: params.invoiceCode,
            address: params.address,
            phoneNo: params.phoneNo,
            faxNo: params.faxNo,
            email: params.email,
            representative: '',
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
