import { BadRequestException, Injectable } from '@nestjs/common';
import { PlanType } from '@prisma/client';
import { Task } from 'src/@shared';
import { Util } from 'src/common';
import { PrismaTransaction } from 'src/common/types';
import { PrismaService } from 'src/core';
import { StockChangeService } from 'src/modules/stock/service/stock-change.service';
import { ulid } from 'ulid';

@Injectable()
export class PlanChangeService {
  constructor(
    private prisma: PrismaService,
    private stockChangeService: StockChangeService,
  ) {}
  async startPlan(params: { planId: number }) {
    const { planId } = params;

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      const plan = await tx.plan.findUnique({
        where: {
          id: planId,
        },
        select: {
          id: true,
          type: true,
          status: true,
          company: true,
          assignStockEvent: {
            select: {
              stock: {
                select: {
                  id: true,
                  product: true,
                  grammage: true,
                  packaging: true,
                  sizeX: true,
                  sizeY: true,
                  paperColorGroup: true,
                  paperColor: true,
                  paperPattern: true,
                  paperCert: true,
                },
              },
            },
          },
        },
      });

      if (plan.status !== 'PREPARING') {
        throw new Error('이미 시작된 Plan 입니다.');
      }

      if (plan.type === 'INHOUSE_PROCESS') {
        const tasks = await tx.task.findMany({
          where: {
            planId: params.planId,
            status: {
              not: 'CANCELLED',
            },
          },
          select: {
            id: true,
            taskNo: true,
            type: true,
            status: true,
            taskConverting: true,
            taskGuillotine: true,
            taskQuantity: true,
            parentTaskId: true,
          },
        });
        const releaseTasks = tasks.filter((task) => task.type === 'RELEASE');

        const input: Task.Process.Input = {
          packagingType: plan.assignStockEvent.stock.packaging.type,
          sizeX: plan.assignStockEvent.stock.sizeX,
          sizeY: plan.assignStockEvent.stock.sizeY,
        };

        const outputs = releaseTasks.map((releaseTask) =>
          Task.Process.applicate(input, tasks, releaseTask.id),
        );

        const skid = await tx.packaging.findFirstOrThrow({
          where: {
            type: 'SKID',
          },
        });

        for (const result of outputs) {
          // 포장이 변경되지 않으면 유지
          const nextPackaging =
            result.packagingType === 'SKID'
              ? skid
              : plan.assignStockEvent.stock.packaging;
          const stock = await tx.stock.create({
            data: {
              serial: Util.serialP(plan.company.invoiceCode),
              companyId: plan.company.id,
              initialPlanId: plan.id,
              planId: plan.id,
              warehouseId: null,
              productId: plan.assignStockEvent.stock.product.id,
              packagingId: nextPackaging.id,
              grammage: plan.assignStockEvent.stock.grammage,
              sizeX: result.sizeX,
              sizeY: result.sizeY,
              paperColorGroupId:
                plan.assignStockEvent.stock.paperColorGroup?.id,
              paperColorId: plan.assignStockEvent.stock.paperColor?.id,
              paperPatternId: plan.assignStockEvent.stock.paperPattern?.id,
              paperCertId: plan.assignStockEvent.stock.paperCert?.id,
              cachedQuantityAvailable: result.quantity,
              stockPrice: {
                create: {
                  officialPriceUnit: 'WON_PER_TON',
                  officialPrice: 0,
                  officialPriceType: 'NONE',
                  discountPrice: 0,
                  discountType: 'NONE',
                  unitPrice: 0,
                  unitPriceUnit: 'WON_PER_TON',
                },
              },
            },
            select: { id: true },
          });
          await tx.stockEvent.create({
            data: {
              stockId: stock.id,
              change: result.quantity,
              status: 'PENDING',
              planId: plan.id,
            },
          });
        }
      }

      return await tx.plan.update({
        where: {
          id: planId,
        },
        data: {
          status: 'PROGRESSING',
        },
      });
    });
  }

  async completePlan(params: { planId: number }) {
    const { planId } = params;

    return await this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: {
          id: planId,
        },
        select: {
          status: true,
          assignStockEvent: true,
        },
      });

      if (plan.status !== 'PROGRESSING') {
        throw new Error('완료할 수 없는 Plan입니다.');
      }

      if (plan.assignStockEvent) {
        await tx.stockEvent.update({
          data: {
            status: 'CANCELLED',
          },
          where: {
            id: plan.assignStockEvent.id,
          },
        });
        await this.stockChangeService.cacheStockQuantityTx(tx, {
          id: plan.assignStockEvent.stockId,
        });
      }

      return await tx.plan.update({
        where: {
          id: planId,
        },
        data: {
          status: 'PROGRESSED',
        },
      });
    });
  }

  async registerInputStock(params: {
    companyId: number;
    planId: number;
    stockId: number;
    quantity: number;
  }) {
    const { planId, stockId, quantity } = params;

    await this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({
        where: {
          id: planId,
        },
        select: {
          status: true,
          type: true,
        },
      });

      if (plan.type === 'TRADE_OUTSOURCE_PROCESS_SELLER') {
        throw new BadRequestException(
          `외주공정 매출은 실투입 재고를 등록할 수 없습니다.`,
        );
      }

      if (plan.status !== 'PROGRESSING') {
        throw new BadRequestException(
          '실투입 재고를 등록할 수 없는 상태의 작업 계획입니다.',
        );
      }

      const stock = await tx.stock.findUnique({
        where: {
          id: stockId,
        },
      });

      if (!stock || stock.companyId !== params.companyId) {
        throw new BadRequestException(`존재하지 않는 재고입니다.`);
      }

      if (stock.planId !== null) {
        throw new BadRequestException(
          `도착예정재고는 실투입 등록할 수 없습니다.`,
        );
      }
      if (stock.cachedQuantity < quantity) {
        throw new BadRequestException('재고의 실물 수량을 초과할 수 없습니다.');
      }

      const se = await tx.stockEvent.create({
        data: {
          change: -quantity,
          stock: {
            connect: {
              id: stockId,
            },
          },
          status: 'NORMAL',
          plan: {
            connect: {
              id: planId,
            },
          },
        },
      });

      await this.stockChangeService.cacheStockQuantityTx(tx, {
        id: se.stockId,
      });
    });
  }

  /** 플랜 생성 */
  private async createPlanTx(
    tx: PrismaTransaction,
    params: {
      type: PlanType;
      companyId: number;
      assignStockEventId: number | null;
      orderStockId: number | null;
      orderProcessId: number | null;
    },
  ) {
    return await tx.plan.create({
      data: {
        planNo: ulid(),
        type: params.type,
        company: {
          connect: {
            id: params.companyId,
          },
        },
        assignStockEvent: params.assignStockEventId
          ? {
              connect: {
                id: params.assignStockEventId,
              },
            }
          : undefined,
        orderStock: params.orderStockId
          ? {
              connect: {
                id: params.orderStockId,
              },
            }
          : undefined,
        orderProcess: params.orderProcessId
          ? {
              connect: {
                id: params.orderProcessId,
              },
            }
          : undefined,
      },
    });
  }

  /** 정상거래 구매자 계획 생성 */
  async createOrderStockSrcPlanTx(
    tx: PrismaTransaction,
    companyId: number,
    orderStockId: number,
  ) {
    return await this.createPlanTx(tx, {
      type: 'TRADE_NORMAL_BUYER',
      companyId,
      assignStockEventId: null,
      orderStockId,
      orderProcessId: null,
    });
  }

  /** 외주공정 판매자 계획 생성 */
  async createOrderProcessDstPlanTx(
    tx: PrismaTransaction,
    companyId: number,
    orderProcessId: number,
  ) {
    return await this.createPlanTx(tx, {
      type: 'TRADE_OUTSOURCE_PROCESS_SELLER',
      companyId,
      assignStockEventId: null,
      orderStockId: null,
      orderProcessId,
    });
  }
}
