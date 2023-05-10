import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core';

@Injectable()
export class WarehouseChangeService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.WarehouseCreateInput) {
    return await this.prisma.warehouse.create({
      data,
    });
  }

  async update(id: number, data: Prisma.WarehouseUpdateInput) {
    return await this.prisma.warehouse.update({
      data,
      where: { id },
    });
  }

  async delete(id: number) {
    return await this.prisma.warehouse.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
