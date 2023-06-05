import { Injectable } from '@nestjs/common';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class TaskRetriveService {
  constructor(private prisma: PrismaService) { }

  async getTaskList(params: { planId: number }) {
    return [];
  }

  async getTaskById(id: number) {
    return await this.prisma.task.findUnique({
      select: Selector.TASK,
      where: {
        id,
      },
    });
  }

  async getTaskListCount(params: { planId: number }) {
    return 0;
  }
}
