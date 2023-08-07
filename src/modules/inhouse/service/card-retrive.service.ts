import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { from, lastValueFrom, map } from 'rxjs';
import { Model } from 'src/@shared';

@Injectable()
export class CardRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getCardList(
    companyId: number,
    skip: number,
    take: number,
  ): Promise<{
    items: Model.Card[];
    total: number;
  }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.card.findMany({
        select: {
          id: true,
          cardName: true,
          cardCompany: true,
          cardNumber: true,
          cardHolder: true,
        },
        where: {
          companyId,
          isDeleted: false,
        },
      }),
      this.prisma.card.count({
        where: {
          companyId,
          isDeleted: false,
        },
      }),
    ]);

    return {
      items,
      total,
    };
  }

  async getCardItem(companyId: number, cardId: number): Promise<Model.Card> {
    const item = await this.prisma.card.findFirst({
      select: {
        id: true,
        cardName: true,
        cardCompany: true,
        cardNumber: true,
        cardHolder: true,
      },
      where: {
        id: cardId,
        companyId,
        isDeleted: false,
      },
    });
    if (!item) throw new NotFoundException(`존재하지 않는 카드 정보입니다.`);

    return item;
  }
}
