import { Injectable } from '@nestjs/common';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';
import { StockChangeService } from 'src/modules/stock/service/stock-change.service';
import { ulid } from 'ulid';
import { Process } from 'src/@shared/task';

@Injectable()
export class TaskChangeService {
  constructor(
    private prisma: PrismaService,
    private stockChange: StockChangeService,
  ) {}

  async createConvertingTask(params: {
    planId: number;
    parentTaskId: number | null;
    sizeX: number;
    sizeY: number;
    memo: string;
  }) {
    const { planId, sizeX, sizeY, memo } = params;
    return await this.prisma.task.create({
      select: Selector.TASK,
      data: {
        planId,
        taskNo: ulid(),
        type: 'CONVERTING',
        status: 'PREPARING',
        taskConverting: {
          create: {
            sizeX,
            sizeY,
            memo,
          },
        },
        parentTaskId: params.parentTaskId,
      },
    });
  }

  async createGuillotineTask(params: {
    planId: number;
    parentTaskId: number | null;
    sizeX: number;
    sizeY: number;
    memo: string;
  }) {
    const { planId, sizeX, sizeY, memo } = params;
    return await this.prisma.task.create({
      select: Selector.TASK,
      data: {
        planId,
        taskNo: ulid(),
        type: 'GUILLOTINE',
        status: 'PREPARING',
        taskGuillotine: {
          create: {
            sizeX,
            sizeY,
            memo,
          },
        },
        parentTaskId: params.parentTaskId,
      },
    });
  }

  async createReleaseTask(params: {
    planId: number;
    parentTaskId: number | null;
    quantity: number;
    memo: string;
  }) {
    const { planId, quantity, memo } = params;
    return await this.prisma.task.create({
      select: Selector.TASK,
      data: {
        planId,
        taskNo: ulid(),
        type: 'RELEASE',
        status: 'PREPARING',
        taskQuantity: {
          create: {
            quantity,
            memo,
          },
        },
        parentTaskId: params.parentTaskId,
      },
    });
  }

  async updateConvertingTask(params: {
    id: number;
    sizeX: number;
    sizeY: number;
    memo: string;
  }) {
    const { id, sizeX, sizeY, memo } = params;
    return await this.prisma.task.update({
      select: Selector.TASK,
      where: {
        id,
      },
      data: {
        taskConverting: {
          update: {
            sizeX,
            sizeY,
            memo,
          },
        },
      },
    });
  }

  async updateGuillotineTask(params: {
    id: number;
    sizeX: number;
    sizeY: number;
    memo: string;
  }) {
    const { id, sizeX, sizeY, memo } = params;
    return await this.prisma.task.update({
      select: Selector.TASK,
      where: {
        id,
      },
      data: {
        taskGuillotine: {
          update: {
            sizeX,
            sizeY,
            memo,
          },
        },
      },
    });
  }

  async updateQuantityTask(params: {
    id: number;
    quantity: number;
    memo: string;
  }) {
    const { id, quantity, memo } = params;
    return await this.prisma.task.update({
      select: Selector.TASK,
      where: {
        id,
      },
      data: {
        taskQuantity: {
          update: {
            quantity,
            memo,
          },
        },
      },
    });
  }

  async deleteTask(id: number) {
    return await this.prisma.task.update({
      select: Selector.TASK,
      where: {
        id,
      },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  async startTask(id: number) {
    const task = await this.prisma.task.findUnique({
      select: {
        type: true,
        status: true,
        parentTask: {
          select: {
            status: true,
          },
        },
      },
      where: {
        id,
      },
    });

    if (task.type === 'RELEASE') {
      throw new Error('수량 작업은 즉시 작업 완료를 호출해야합니다.');
    }

    if (task.status !== 'PREPARING') {
      throw new Error('이미 진행중인 작업입니다.');
    }

    if (task.parentTask && task.parentTask.status !== 'PROGRESSED') {
      throw new Error('이전 작업이 완료되지 않았습니다.');
    }

    return await this.prisma.task.update({
      select: Selector.TASK,
      where: {
        id,
      },
      data: {
        status: 'PROGRESSING',
      },
    });
  }

  async resetTask(id: number) {
    const task = await this.prisma.task.findUnique({
      select: {
        type: true,
        status: true,
        parentTask: {
          select: {
            status: true,
          },
        },
      },
      where: {
        id,
      },
    });

    if (task.status !== 'PROGRESSING') {
      throw new Error('이미 진행중인 작업이 아닙니다.');
    }

    return await this.prisma.task.update({
      select: Selector.TASK,
      where: {
        id,
      },
      data: {
        status: 'PREPARING',
      },
    });
  }

  async finishTask(id: number) {
    return await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        select: {
          id: true,
          type: true,
          status: true,
          parentTask: {
            select: {
              status: true,
            },
          },
          plan: {
            select: {
              id: true,
              type: true,
              orderStock: true,
              company: {
                select: {
                  id: true,
                  invoiceCode: true,
                },
              },
              targetStockEvent: {
                select: Selector.STOCK_EVENT,
              },
              assignStockEvent: {
                select: Selector.STOCK_EVENT,
              },
            },
          },
        },
        where: {
          id,
        },
      });
      if (task.status === 'PROGRESSED') {
        throw new Error('이미 완료된 작업입니다.');
      }
      if (task.type === 'RELEASE') {
        const allTasks = await tx.task.findMany({
          select: Selector.TASK,
          where: {
            planId: task.plan.id,
            status: {
              not: 'CANCELLED',
            },
          },
        });
        const result = Process.applicate(
          {
            packagingType: task.plan.assignStockEvent.stock.packaging.type,
            sizeX: task.plan.assignStockEvent.stock.sizeX,
            sizeY: task.plan.assignStockEvent.stock.sizeY,
          },
          allTasks,
          task.id,
        );
        const packaging = await tx.packaging.findFirstOrThrow({
          select: {
            id: true,
          },
          where: {
            type: task.plan.assignStockEvent.stock.packaging.type,
          },
        });
        if (task.plan.orderStock) {
          const skid = await tx.packaging.findFirstOrThrow({
            where: {
              type: 'SKID',
            },
          });

          const nextPackaging =
            result.packagingType === 'SKID'
              ? skid
              : task.plan.assignStockEvent.stock.packaging;

          // 주문에 연결된 작업은 송장을 생성
          await tx.invoice.create({
            data: {
              invoiceNo: Util.serialI(task.plan.company.invoiceCode),
              plan: {
                connect: {
                  id: task.plan.id,
                },
              },
              product: {
                connect: {
                  id: task.plan.assignStockEvent.stock.product.id,
                },
              },
              packaging: {
                connect: {
                  id: nextPackaging.id,
                },
              },
              grammage: task.plan.assignStockEvent.stock.grammage,
              sizeX: result.sizeX,
              sizeY: result.sizeY,
              paperColorGroup: task.plan.assignStockEvent.stock.paperColorGroup
                ? {
                    connect: {
                      id: task.plan.assignStockEvent.stock.paperColorGroup.id,
                    },
                  }
                : undefined,
              paperColor: task.plan.assignStockEvent.stock.paperColor
                ? {
                    connect: {
                      id: task.plan.assignStockEvent.stock.paperColor.id,
                    },
                  }
                : undefined,
              paperPattern: task.plan.assignStockEvent.stock.paperPattern
                ? {
                    connect: {
                      id: task.plan.assignStockEvent.stock.paperPattern.id,
                    },
                  }
                : undefined,
              paperCert: task.plan.assignStockEvent.stock.paperCert
                ? {
                    connect: {
                      id: task.plan.assignStockEvent.stock.paperCert.id,
                    },
                  }
                : undefined,
              quantity: result.quantity,
            },
          });
        }
      }
      return await tx.task.update({
        select: Selector.TASK,
        where: {
          id,
        },
        data: {
          status: 'PROGRESSED',
        },
      });
    });
  }

  async insertInputStock(params: {
    taskId: number;
    stockId: number;
    quantity: number;
  }) {
    const { taskId, stockId, quantity } = params;

    await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        select: {
          id: true,
          plan: {
            select: {
              id: true,
              status: true,
            },
          },
          type: true,
        },
        where: {
          id: taskId,
        },
      });

      if (task.plan.status !== 'PROGRESSING') {
        throw new Error('작업 진행 상태가 아닙니다.');
      }

      await tx.stockEvent.create({
        select: {
          id: true,
        },
        data: {
          stock: {
            connect: {
              id: stockId,
            },
          },
          change: -quantity,
          status: 'NORMAL',
          plan: {
            connect: {
              id: task.plan.id,
            },
          },
        },
      });

      await this.stockChange.cacheStockQuantityTx(tx, {
        id: stockId,
      });
    });
  }
}
