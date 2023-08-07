import { Injectable, NotFoundException } from '@nestjs/common';
import { from, lastValueFrom } from 'rxjs';
import {
  CardCreateRequest,
  CardUpdateRequest,
} from 'src/@shared/api/inhouse/card.request';
import { PrismaService } from 'src/core';

@Injectable()
export class CardChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createCard(
    companyId: number,
    cardCreateRequest: CardCreateRequest,
  ): Promise<void> {
    await this.prisma.card.create({
      data: {
        cardName: cardCreateRequest.cardName,
        cardCompany: cardCreateRequest.cardCompany,
        cardNumber: cardCreateRequest.cardNumber,
        cardHolder: cardCreateRequest.cardHolder,
        company: {
          connect: {
            id: companyId,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  async updateCard(params: {
    companyId: number;
    cardId: number;
    cardName: string;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: {
          id: params.cardId,
          companyId: params.companyId,
          isDeleted: false,
        },
      });
      if (!card) throw new NotFoundException(`존재하지 않는 카드 정보입니다.`);

      await this.prisma.card.update({
        data: {
          cardName: params.cardName,
        },
        where: {
          id: params.cardId,
        },
      });
    });
  }

  async deleteCard(companyId: number, cardId: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: {
          id: cardId,
          companyId,
          isDeleted: false,
        },
      });
      if (!card) throw new NotFoundException(`존재하지 않는 카드 정보입니다.`);

      await this.prisma.card.update({
        data: {
          isDeleted: true,
        },
        where: {
          id: cardId,
        },
      });
    });
  }
}
