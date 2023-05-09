import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core';

@Injectable()
export class VirtualCompanyChangeService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CompanyCreateInput) {
    return await this.prisma.company.create({
      data,
    });
  }

  async update(id: number, data: Prisma.CompanyUpdateInput) {
    return await this.prisma.company.update({
      data,
      where: { id },
    });
  }
}
