import { Injectable } from '@nestjs/common';
import { PrismaTransaction } from 'src/common/types';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class PlanChangeService {
  constructor(private prisma: PrismaService) {}

  async createPlan(params: {
    companyId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    warehouseId: number | null;
    memo: string;
    quantity: number;
  }) {
    const {
      companyId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      warehouseId,
      memo,
      quantity,
    } = params;

    console.log('TEST', params);

    await this.prisma.$transaction(async (tx) => {
      const sg =
        (await tx.stockGroup.findFirst({
          where: {
            productId,
            packagingId,
            grammage,
            sizeX,
            sizeY,
            paperColorGroupId,
            paperColorId,
            paperPatternId,
            paperCertId,
            warehouseId,
            companyId,
          },
        })) ??
        (await tx.stockGroup.create({
          data: {
            companyId,
            productId,
            packagingId,
            grammage,
            sizeX,
            sizeY,
            paperColorGroupId,
            paperColorId,
            paperPatternId,
            paperCertId,
            warehouseId,
          },
        }));

      const sge = await tx.stockGroupEvent.create({
        data: {
          stockGroupId: sg.id,
          change: quantity,
          status: 'PENDING',
        },
      });

      await tx.plan.create({
        data: {
          company: {
            connect: {
              id: companyId,
            },
          },
          planNo: ulid(),
          memo,
          targetStockGroupEvent: {
            connect: {
              id: sge.id,
            },
          },
        },
      });
    });
  }

  async createPlanWithOrder(
    tx: PrismaTransaction,
    params: {
      orderStockId: number;
      companyId: number;
      productId: number;
      packagingId: number;
      grammage: number;
      sizeX: number;
      sizeY: number;
      paperColorGroupId: number | null;
      paperColorId: number | null;
      paperPatternId: number | null;
      paperCertId: number | null;
      warehouseId: number | null;
      memo: string;
      quantity: number;
    },
  ) {
    const {
      orderStockId,
      companyId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      warehouseId,
      memo,
      quantity,
    } = params;

    console.log('TEST', params);

    const sg =
      (await tx.stockGroup.findFirst({
        where: {
          companyId,
          warehouseId: warehouseId != null ? warehouseId : undefined,
          productId,
          packagingId,
          grammage,
          sizeX,
          sizeY,
          paperColorGroupId:
            paperColorGroupId != null ? paperColorGroupId : undefined,
          paperColorId: paperColorId != null ? paperColorId : undefined,
          paperPatternId: paperPatternId != null ? paperPatternId : undefined,
          paperCertId: paperCertId != null ? paperCertId : undefined,
        },
      })) ??
      (await tx.stockGroup.create({
        data: {
          companyId,
          warehouseId: warehouseId != null ? warehouseId : undefined,
          productId,
          packagingId,
          grammage,
          sizeX,
          sizeY,
          paperColorGroupId:
            paperColorGroupId != null ? paperColorGroupId : undefined,
          paperColorId: paperColorId != null ? paperColorId : undefined,
          paperPatternId: paperPatternId != null ? paperPatternId : undefined,
          paperCertId: paperCertId != null ? paperCertId : undefined,
        },
      }));

    const sge = await tx.stockGroupEvent.create({
      data: {
        stockGroupId: sg.id,
        change: quantity,
        status: 'PENDING',
      },
    });

    await tx.plan.create({
      data: {
        orderStock: {
          connect: {
            id: orderStockId,
          },
        },
        company: {
          connect: {
            id: companyId,
          },
        },
        planNo: ulid(),
        memo,
        targetStockGroupEvent: {
          connect: {
            id: sge.id,
          },
        },
      },
    });
  }

  async startPlan(params: { planId: number }) {
    const { planId } = params;

    const plan = await this.prisma.plan.findUnique({
      where: {
        id: planId,
      },
      select: {
        status: true,
      },
    });

    if (plan.status !== 'PREPARING') {
      throw new Error('이미 시작된 Plan 입니다.');
    }

    return await this.prisma.plan.update({
      where: {
        id: planId,
      },
      data: {
        status: 'PROGRESSING',
      },
    });
  }

  async completePlan(params: { planId: number }) {
    const { planId } = params;

    const plan = await this.prisma.plan.findUnique({
      where: {
        id: planId,
      },
      select: {
        status: true,
      },
    });

    if (plan.status !== 'PROGRESSING') {
      throw new Error('완료할 수 없는 Plan입니다.');
    }

    return await this.prisma.plan.update({
      where: {
        id: planId,
      },
      data: {
        status: 'PROGRESSED',
      },
    });

    // TODO: 입고 가능한 Release 재고를 생성합니다.
  }
}
