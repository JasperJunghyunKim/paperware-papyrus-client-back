import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PackagingType, Prisma } from '@prisma/client';
import { Model } from 'src/@shared';
import { PrismaTransaction } from 'src/common/types';
import { PrismaService } from 'src/core';

@Injectable()
export class DepositChangeService {
  constructor(private readonly prisma: PrismaService) {}

  /** 보관량 증감 */
  async createDeposit(params: {
    userId: number;
    companyId: number;
    srcCompanyRegistrationNumber: string;
    dstCompanyRegistrationNumber: string;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    memo: string;
  }) {
    const {
      companyId,
      srcCompanyRegistrationNumber,
      dstCompanyRegistrationNumber,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      quantity,
      memo,
    } = params;

    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
    if (
      company.companyRegistrationNumber !== srcCompanyRegistrationNumber &&
      company.companyRegistrationNumber !== dstCompanyRegistrationNumber
    ) {
      throw new BadRequestException(
        `srcCompany 또는 dstCompany가 자신의 회사로 지정되어야 합니다.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const deposit =
        (await tx.deposit.findFirst({
          where: {
            srcCompanyRegistrationNumber,
            dstCompanyRegistrationNumber,
            packagingId: packagingId,
            productId: productId,
            grammage: grammage,
            sizeX: sizeX,
            sizeY: sizeY || 0,
            paperColorGroupId: paperColorGroupId || null,
            paperColorId: paperColorId || null,
            paperPatternId: paperPatternId || null,
            paperCertId: paperCertId || null,
          },
        })) ||
        (await tx.deposit.create({
          data: {
            srcCompanyRegistrationNumber,
            dstCompanyRegistrationNumber,
            packaging: {
              connect: {
                id: packagingId,
              },
            },
            product: {
              connect: {
                id: productId,
              },
            },
            grammage: grammage,
            sizeX: sizeX,
            sizeY: sizeY,
            paperColorGroup: paperColorGroupId
              ? {
                  connect: {
                    id: paperColorGroupId,
                  },
                }
              : undefined,
            paperColor: paperColorId
              ? {
                  connect: {
                    id: paperColorId,
                  },
                }
              : undefined,
            paperPattern: paperPatternId
              ? {
                  connect: {
                    id: paperPatternId,
                  },
                }
              : undefined,
            paperCert: paperCertId
              ? {
                  connect: {
                    id: paperCertId,
                  },
                }
              : undefined,
          },
        }));

      await tx.depositEvent.create({
        data: {
          deposit: {
            connect: {
              id: deposit.id,
            },
          },
          user: {
            connect: {
              id: params.userId,
            },
          },
          change: quantity,
          memo: memo || '',
        },
      });
    });
  }
}
