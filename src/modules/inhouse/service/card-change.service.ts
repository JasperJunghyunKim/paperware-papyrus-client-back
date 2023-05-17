import { Injectable } from '@nestjs/common';
import { from, lastValueFrom } from 'rxjs';
import { CardCreateRequest, CardUpdateRequest } from 'src/@shared/api/inhouse/card.request';
import { PrismaService } from 'src/core';

@Injectable()
export class CardChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createCard(companyId: number, cardCreateRequest: CardCreateRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.card.create({
          data: {
            cardName: cardCreateRequest.cardName,
            cardCompany: cardCreateRequest.cardCompany,
            cardNumber: cardCreateRequest.cardNumber,
            cardHolder: cardCreateRequest.cardHolder,
            company: {
              connect: {
                id: companyId,
              }
            }
          },
          select: {
            id: true,
          },
        })
      )
    );
  }

  async updateCard(cardId: number, cardUpdateRequest: CardUpdateRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.card.update({
          data: {
            cardName: cardUpdateRequest.cardName,
          },
          select: {
            id: true,
          },
          where: {
            id: cardId,
          }
        })
      )
    );
  }

  async deleteCard(cardId: number): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.card.update({
          data: {
            isDeleted: true,
          },
          where: {
            id: cardId
          }
        })
      )
    );
  }
}
