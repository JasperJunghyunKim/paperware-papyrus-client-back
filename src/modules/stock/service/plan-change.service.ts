import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Util } from 'src/common';
import { PrismaService } from 'src/core';
import { match } from 'ts-pattern';
import { ulid } from 'ulid';

@Injectable()
export class PlanChangeService {
  constructor(private prisma: PrismaService) {}

  /** 지정 Plan에 입고예정재고를 생성하거나 수정합니다.
   * 수량 수정: 이미 존재하는 동일한 스펙(Product~Cert)의 입고예정재고가 있다면 모두 취소(CANCELLED) 처리된 후 새로운 입고예정재고를 생성합니다.
   * @returns 생성된 record의 id
   */
  async upsertReceiving(
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
    params: {
      /** 입고예정재고를 생성할 PlanId */
      planId: number;
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
      quantity: number;
      price: Model.StockPrice;
    },
  ) {
    const plan = await tx.plan.findUnique({
      where: {
        id: params.planId,
      },
      select: {
        id: true,
        company: {
          select: {
            id: true,
            invoiceCode: true,
          },
        },
      },
    });

    // 동일한 스펙의 입고예정재고를 모두 취소처리
    await tx.stockEvent.updateMany({
      data: {
        status: 'CANCELLED',
      },
      where: {
        plan: {
          every: {
            id: {
              equals: params.planId,
            },
          },
        },
        stock: {
          productId: params.productId,
          packagingId: params.packagingId,
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY,
          paperColorGroupId: params.paperColorGroupId,
          paperColorId: params.paperColorId,
          paperPatternId: params.paperPatternId,
          paperCertId: params.paperCertId,
        },
        status: 'PENDING',
      },
    });

    const stock = await tx.stock.create({
      data: {
        serial: Util.serialP(plan.company.invoiceCode),
        companyId: plan.company.id,
        initialPlanId: plan.id,
        warehouseId: params.warehouseId,
        productId: params.productId,
        packagingId: params.packagingId,
        grammage: params.grammage,
        sizeX: params.sizeX,
        sizeY: params.sizeY,
        paperColorGroupId: params.paperColorGroupId,
        paperColorId: params.paperColorId,
        paperPatternId: params.paperPatternId,
        paperCertId: params.paperCertId,
        cachedQuantity: params.quantity,
        stockPrice: {
          create: {
            ...params.price,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const stockEvent = await tx.stockEvent.create({
      data: {
        stock: {
          connect: {
            id: stock.id,
          },
        },
        change: params.quantity,
        status: 'PENDING',
        plan: {
          connect: {
            id: params.planId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return {
      stockId: stock.id,
      stockEventId: stockEvent.id,
    };
  }

  async create(params: {
    companyId: number;
    warehouseId: number | null;
    planId: number | null;
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
    price: Model.StockPrice;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({
        data: {
          planNo: ulid(),
          type: 'INHOUSE_PROCESS',
          companyId: params.companyId,
        },
        select: {
          id: true,
          company: {
            select: {
              id: true,
              invoiceCode: true,
            },
          },
        },
      });

      // 원지 재고 생성
      const stock = await tx.stock.create({
        data: {
          serial: Util.serialP(plan.company.invoiceCode),
          companyId: params.companyId,
          initialPlanId: plan.id,
          warehouseId: params.warehouseId,
          planId: params.planId,
          productId: params.productId,
          packagingId: params.packagingId,
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY,
          paperColorGroupId: params.paperColorGroupId,
          paperColorId: params.paperColorId,
          paperPatternId: params.paperPatternId,
          paperCertId: params.paperCertId,
          cachedQuantity: params.quantity,
          stockPrice: {
            create: {
              ...params.price,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const stockEvent = await tx.stockEvent.create({
        data: {
          stock: {
            connect: {
              id: stock.id,
            },
          },
          change: params.quantity,
          status: 'PENDING',
          assignPlan: {
            connect: {
              id: plan.id,
            },
          },
        },
        select: {
          id: true,
        },
      });

      return {
        planId: plan.id,
        stockId: stock.id,
        stockEventId: stockEvent.id,
      };
    });
  }

  async updateStatus(params: {
    planId: number;
    direction: 'forward' | 'backward';
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: {
          id: params.planId,
        },
        select: {
          id: true,
          type: true,
          status: true,
        },
      });

      const nextStatus = match<'forward' | 'backward', Model.Enum.PlanStatus>(
        params.direction,
      )
        .with('forward', () =>
          match<Model.Enum.PlanStatus, Model.Enum.PlanStatus>(plan.status)
            .with('PREPARING', () => 'PROGRESSING')
            .with('PROGRESSING', () => 'PROGRESSED')
            .otherwise(() => {
              throw new BadRequestException();
            }),
        )
        .with('backward', () =>
          match<Model.Enum.PlanStatus, Model.Enum.PlanStatus>(plan.status)
            .with('PROGRESSING', () => 'PREPARING')
            .otherwise(() => {
              throw new BadRequestException();
            }),
        )
        .otherwise(() => {
          throw new BadRequestException();
        });

      // 작업 완료시 원지의 PENDING 상태 이벤트를 모두 취소하여 가용수량을 원복
      if (nextStatus === 'PROGRESSED') {
        await tx.stockEvent.updateMany({
          data: {
            status: 'CANCELLED',
          },
          where: {
            assignPlan: {
              every: {
                id: {
                  equals: params.planId,
                },
              },
            },
            status: 'PENDING',
          },
        });
      }

      await tx.plan.update({
        where: {
          id: params.planId,
        },
        data: {
          status: nextStatus,
        },
      });

      return {
        planId: plan.id,
        status: nextStatus,
      };
    });
  }
}
