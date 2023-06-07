import { Injectable, NotFoundException } from "@nestjs/common";
import { DepositType, PackagingType, Prisma } from "@prisma/client";
import { Model } from "src/@shared";
import { PrismaTransaction } from "src/common/types";
import { PrismaService } from "src/core";

@Injectable()
export class DepositChangeService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  /** 보관량 증감 */
  async createDeposit(params: {
    companyId: number;
    type: DepositType;
    partnerCompanyRegistrationNumber: string;
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
      type,
      partnerCompanyRegistrationNumber,
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

    await this.prisma.$transaction(async tx => {
      const deposit = await tx.deposit.findFirst({
        where: {
          companyId,
          partnerCompanyRegistrationNumber,
          depositType: type,
          packagingId: packagingId,
          productId: productId,
          grammage: grammage,
          sizeX: sizeX,
          sizeY: sizeY || 0,
          paperColorGroupId: paperColorGroupId || null,
          paperColorId: paperColorId || null,
          paperPatternId: paperPatternId || null,
          paperCertId: paperCertId || null,
        }
      }) || await tx.deposit.create({
        data: {
          company: {
            connect: {
              id: companyId,
            }
          },
          partnerCompanyRegistrationNumber,
          depositType: type,
          packaging: {
            connect: {
              id: packagingId,
            }
          },
          product: {
            connect: {
              id: productId,
            }
          },
          grammage: grammage,
          sizeX: sizeX,
          sizeY: sizeY,
          paperColorGroup: paperColorGroupId ? {
            connect: {
              id: paperColorGroupId,
            }
          } : undefined,
          paperColor: paperColorId ? {
            connect: {
              id: paperColorId,
            }
          } : undefined,
          paperPattern: paperPatternId ? {
            connect: {
              id: paperPatternId,
            }
          } : undefined,
          paperCert: paperCertId ? {
            connect: {
              id: paperCertId,
            }
          } : undefined,
        }
      });

      await tx.depositEvent.create({
        data: {
          deposit: {
            connect: {
              id: deposit.id,
            }
          },
          change: quantity,
          memo: memo || '',
        }
      })
    });
  }

  async createDepositEventTx(tx: PrismaTransaction, params: {
    depositId: number;
    orderId: number | null;
    packagingId: number;
    productId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
  }) {
    const {
      depositId,
      orderId,
      packagingId,
      productId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      quantity,
    } = params;

    await tx.depositEvent.create({
      data: {
        deposit: {
          connect: {
            id: depositId,
          }
        },
        change: -quantity,
        orderDeposit: {
          create: {
            order: {
              connect: {
                id: orderId,
              }
            },
            packaging: {
              connect: {
                id: packagingId,
              }
            },
            product: {
              connect: {
                id: productId,
              }
            },
            grammage: grammage,
            sizeX: sizeX,
            sizeY: sizeY,
            paperColorGroup: paperColorGroupId ? {
              connect: {
                id: paperColorGroupId
              }
            } : undefined,
            paperColor: paperColorId ? {
              connect: {
                id: paperColorId
              }
            } : undefined,
            paperPattern: paperPatternId ? {
              connect: {
                id: paperPatternId
              }
            } : undefined,
            paperCert: paperCertId ? {
              connect: {
                id: paperCertId
              }
            } : undefined,
            quantity: -quantity,
          }
        }
      }
    });
  }

  async deleteOrderDepositEventTx(tx: PrismaTransaction, depositEventId: number) {
    const deleteDepositEvent =
      await tx.depositEvent.delete({
        select: {
          orderDepositId: true,
        },
        where: {
          id: depositEventId,
        }
      });

    if (deleteDepositEvent.orderDepositId) {
      await tx.orderDeposit.delete({
        where: {
          id: deleteDepositEvent.orderDepositId,
        }
      });
    }
  }
}