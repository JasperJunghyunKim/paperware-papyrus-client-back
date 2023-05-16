import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { CardResponseDto } from '../api/dto/card.response';
import { from, lastValueFrom, map } from 'rxjs';

@Injectable()
export class CardRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getCardList(companyId: number): Promise<CardResponseDto[]> {
    return await lastValueFrom(from(
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
          isDeleted: true,
        }
      })
    ).pipe(
      map((cardList) => {
        return cardList.map((card) => {
          return {
            cardId: card.id,
            cardName: card.cardName,
            cardCompany: card.cardCompany,
            cardNumber: card.cardNumber,
            cardHolder: card.cardHolder,
          }
        })
      }
      ))
    );
  }
}
