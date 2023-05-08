import { Injectable } from '@nestjs/common';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class TaskChangeService {
  constructor(private prisma: PrismaService) {}

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
}
