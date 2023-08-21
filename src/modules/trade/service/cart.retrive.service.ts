import { Injectable } from '@nestjs/common';
import { CartType } from '@prisma/client';
import { Model } from 'src/@shared';
import { PrismaService } from 'src/core';

@Injectable()
export class CartRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(userId: number, type: CartType): Promise<Model.Cart[]> {
    const items = await this.prisma.cart.findMany({
      where: {
        userId,
        type,
        isDeleted: false,
      },
    });

    return items;
  }
}
