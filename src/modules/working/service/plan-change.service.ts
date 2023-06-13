import { Injectable } from '@nestjs/common';
import { Task } from 'src/@shared';
import { Util } from 'src/common';
import { PrismaTransaction } from 'src/common/types';
import { PrismaService } from 'src/core';
import { StockChangeService } from 'src/modules/stock/service/stock-change.service';

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
              cachedQuantity: result.quantity,
            },
            select: { id: true },
          });
          await tx.stockEvent.create({
            data: {
              stockId: stock.id,
              change: result.quantity,
              status: 'PENDING',
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
  }

  async registerInputStock(params: {
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
        },
      });

      if (plan.status !== 'PROGRESSING') {
        throw new Error('실투입 재고를 등록할 수 없는 상태의 작업 계획입니다.');
      }

      const se = await tx.stockEvent.create({
        data: {
          change: -quantity,
          stockId,
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
}
