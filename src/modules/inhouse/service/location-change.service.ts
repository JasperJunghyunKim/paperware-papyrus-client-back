import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core';

@Injectable()
export class LocationChangeService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.LocationCreateInput) {
    return await this.prisma.location.create({
      data,
    });
  }

  async update(id: number, data: Prisma.LocationUpdateInput) {
    return await this.prisma.location.update({
      data,
      where: { id },
    });
  }

  async delete(id: number) {
    return await this.prisma.location.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
