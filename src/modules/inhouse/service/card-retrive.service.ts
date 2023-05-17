import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { CardItemResponseDto, CardListResponseDto } from '../api/dto/card.response';
import { from, lastValueFrom, map } from 'rxjs';

@Injectable()
export class CardRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getCardList(companyId: number): Promise<CardListResponseDto> {
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
          isDeleted: false,
        }
      })
    ).pipe(
      map((cardList) => {
        return {
          items: cardList.map((card) => {
            return {
              cardId: card.id,
              cardName: card.cardName,
              cardCompany: card.cardCompany,
              cardNumber: card.cardNumber,
              cardHolder: card.cardHolder,
            }
          }),
          total: cardList.length,
        }
      }
      ))
    );
  }

  async getCardItem(cardId: number): Promise<CardItemResponseDto> {
    return await lastValueFrom(from(
      this.prisma.card.findFirst({
        select: {
          id: true,
          cardName: true,
          cardCompany: true,
          cardNumber: true,
          cardHolder: true,
        },
        where: {
          id: cardId,
          isDeleted: false,
        }
      })
    ).pipe(
      map((card) => {
        return {
          cardId: card.id,
          cardName: card.cardName,
          cardCompany: card.cardCompany,
          cardNumber: card.cardNumber,
          cardHolder: card.cardHolder,
        }
      })
    )
    );
  }
}
