import { Injectable } from '@nestjs/common';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';
import { StockChangeService } from 'src/modules/stock/service/stock-change.service';
import { ulid } from 'ulid';

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
        isDeleted: false,
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
        isDeleted: false,
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

  async createQuantityTask(params: {
    planId: number;
    parentTaskId: number | null;
    quantity: number;
  }) {
    const { planId, quantity } = params;
    return await this.prisma.task.create({
      select: Selector.TASK,
      data: {
        planId,
        taskNo: ulid(),
        isDeleted: false,
        type: 'QUANTITY',
        status: 'PREPARING',
        taskQuantity: {
          create: {
            quantity,
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

  async updateQuantityTask(params: { id: number; quantity: number }) {
    const { id, quantity } = params;
    return await this.prisma.task.update({
      select: Selector.TASK,
      where: {
        id,
      },
      data: {
        taskQuantity: {
          update: {
            quantity,
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
        isDeleted: true,
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

    if (task.type === 'QUANTITY') {
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

    if (task.status === 'PROGRESSED') {
      throw new Error('이미 완료된 작업입니다.');
    }

    return await this.prisma.task.update({
      select: Selector.TASK,
      where: {
        id,
      },
      data: {
        status: 'PROGRESSED',
      },
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
          stockId: stockId,
          change: -quantity,
          status: 'NORMAL',
          planIn: {
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
