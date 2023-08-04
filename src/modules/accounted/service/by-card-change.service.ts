import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import {
  ByCardCreateRequestDto,
  ByCardUpdateRequestDto,
} from '../api/dto/card.request';

@Injectable()
export class ByCardChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createCard(
    companyId: number,
    accountedType: AccountedType,
    byCardCreateRequest: ByCardCreateRequestDto,
  ): Promise<void> {
    const amount = byCardCreateRequest.amount;
    const chargeAmount = byCardCreateRequest.chargeAmount || 0;
    const totalAmount =
      amount +
      (byCardCreateRequest.isCharge
        ? accountedType === 'PAID'
          ? -chargeAmount
          : chargeAmount
        : 0);

    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            // TODO: company, partner 확인
            company: {
              connect: {
                id: companyId,
              },
            },
            partnerCompanyRegistrationNumber:
              byCardCreateRequest.companyRegistrationNumber,
            accountedType,
            accountedSubject: byCardCreateRequest.accountedSubject,
            accountedMethod: 'CARD_PAYMENT',
            accountedDate: byCardCreateRequest.accountedDate,
            memo: byCardCreateRequest.memo || '',
            byCard: {
              create: {
                cardAmount: amount,
                isCharge: byCardCreateRequest.isCharge,
                chargeAmount: chargeAmount,
                totalAmount: totalAmount,
                approvalNumber: byCardCreateRequest.approvalNumber ?? '',
                card:
                  accountedType === 'PAID'
                    ? {
                        connect: {
                          id: byCardCreateRequest.cardId,
                        },
                      }
                    : undefined,
                bankAccount:
                  accountedType === 'COLLECTED'
                    ? {
                        connect: {
                          id: byCardCreateRequest.bankAccountId,
                        },
                      }
                    : undefined,
              },
            },
          },
        }),
      ),
    );
  }

  async updateCard(
    accountedType: AccountedType,
    accountedId: number,
    byCardUpdateRequest: ByCardUpdateRequestDto,
  ): Promise<void> {
    const amount = byCardUpdateRequest.amount;
    const chargeAmount = byCardUpdateRequest.chargeAmount || 0;
    const totalAmount =
      amount +
      (byCardUpdateRequest.isCharge
        ? accountedType === 'PAID'
          ? -chargeAmount
          : chargeAmount
        : 0);

    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            accountedType,
            accountedSubject: byCardUpdateRequest.accountedSubject,
            accountedDate: byCardUpdateRequest.accountedDate,
            memo: byCardUpdateRequest.memo || '',
            byCard: {
              update: {
                cardAmount: amount,
                isCharge: byCardUpdateRequest.isCharge,
                chargeAmount: chargeAmount,
                totalAmount: totalAmount,
                approvalNumber: byCardUpdateRequest.approvalNumber || '',
              },
            },
          },
          where: {
            id: accountedId,
          },
        }),
      ),
    );
  }

  async deleteCard(
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byCard: true,
      },
      where: {
        id: accountedId,
        accountedType,
      },
    });

    await lastValueFrom(
      from(
        this.prisma.byCard.update({
          data: {
            isDeleted: true,
            accounted: {
              update: {
                isDeleted: true,
              },
            },
          },
          include: {
            accounted: true,
          },
          where: {
            id: result.byCard.id,
          },
        }),
      ),
    );
  }
}
