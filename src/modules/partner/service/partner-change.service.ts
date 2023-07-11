import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class PartnerChangeSerivce {
  constructor(private readonly prisma: PrismaService) {}

  async createTaxManager(params: {
    companyId: number;
    companyRegistrationNumber: string;
    name: string;
    phoneNo: string;
    email: string;
    isDefault: boolean;
  }) {
    await this.prisma.$transaction(async (tx) => {
      const partner = await tx.partner.findUnique({
        include: {
          partnerTaxManager: {
            where: {
              isDeleted: false,
            },
          },
        },
        where: {
          companyId_companyRegistrationNumber: {
            companyId: params.companyId,
            companyRegistrationNumber: params.companyRegistrationNumber,
          },
        },
      });
      if (!partner) throw new NotFoundException(`존재하지 않는 거래처입니다.`);

      if (partner.partnerTaxManager.length >= 4)
        throw new ConflictException(
          `세금계산서 담당자는 4명까지만 등록 가능합니다.`,
        );

      // 대표담당자로 지정되었으면 기존 대표담당자 제거
      if (params.isDefault) {
        await tx.partnerTaxManager.updateMany({
          data: {
            isDefault: false,
          },
          where: {
            partnerId: partner.id,
          },
        });
      }

      await tx.partnerTaxManager.create({
        data: {
          partner: {
            connect: {
              id: partner.id,
            },
          },
          name: params.name,
          phoneNo: params.phoneNo,
          email: params.email,
          isDefault: params.isDefault,
        },
      });
    });
  }

  async updateTaxManger(params: {
    companyId: number;
    taxManagerId: number;
    name: string;
    phoneNo: string;
    email: string;
    isDefault: boolean;
  }) {
    await this.prisma.$transaction(async (tx) => {
      const taxManager = await tx.partnerTaxManager.findUnique({
        include: {
          partner: true,
        },
        where: {
          id: params.taxManagerId,
        },
      });
      if (
        !taxManager ||
        taxManager.isDeleted ||
        taxManager.partner.companyId !== params.companyId
      ) {
        throw new NotFoundException(`존재하지 않는 세금계산서 담당자 입니다.`);
      }

      // 대표담당자로 지정되었으면 기존 대표담당자 제거
      if (params.isDefault) {
        await tx.partnerTaxManager.updateMany({
          data: {
            isDefault: false,
          },
          where: {
            partnerId: taxManager.partner.id,
          },
        });
      }

      await tx.partnerTaxManager.update({
        where: {
          id: params.taxManagerId,
        },
        data: {
          name: params.name,
          phoneNo: params.phoneNo,
          email: params.email,
          isDefault: params.isDefault,
        },
      });
    });
  }

  async deleteTaxManager(params: { companyId: number; taxManagerId: number }) {
    await this.prisma.$transaction(async (tx) => {
      const taxManager = await tx.partnerTaxManager.findUnique({
        include: {
          partner: true,
        },
        where: {
          id: params.taxManagerId,
        },
      });
      if (
        !taxManager ||
        taxManager.isDeleted ||
        taxManager.partner.companyId !== params.companyId
      ) {
        throw new NotFoundException(`존재하지 않는 세금계산서 담당자 입니다.`);
      }

      await tx.partnerTaxManager.update({
        where: {
          id: params.taxManagerId,
        },
        data: {
          isDeleted: true,
        },
      });
    });
  }
}
