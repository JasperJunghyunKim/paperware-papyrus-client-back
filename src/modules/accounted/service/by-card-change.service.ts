import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const cardAmount = byCardCreateRequest.amount;
    const vatPrice = byCardCreateRequest.chargeAmount || 0;
    const amount =
      cardAmount +
      (byCardCreateRequest.isCharge
        ? accountedType === 'PAID'
          ? -vatPrice
          : vatPrice
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
                vatPrice: vatPrice,
                amount: amount,
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
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
    byCardUpdateRequest: ByCardUpdateRequestDto,
  ): Promise<void> {
    const check = await this.prisma.accounted.findFirst({
      where: {
        id: accountedId,
        accountedType,
        companyId,
        isDeleted: false,
      },
    });
    if (!check)
      throw new NotFoundException(`존재하지 않는 수금/지급 정보 입니다.`);
    if (check.accountedMethod !== 'CARD_PAYMENT')
      throw new ConflictException(`수금/지급 수단 에러`);

    const cardAmount = byCardUpdateRequest.amount;
    const vatPrice = byCardUpdateRequest.chargeAmount || 0;
    const amount =
      cardAmount +
      (byCardUpdateRequest.isCharge
        ? accountedType === 'PAID'
          ? -vatPrice
          : vatPrice
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
                vatPrice: vatPrice,
                amount: amount,
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
