import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { ByCardResponseDto } from '../api/dto/card.response';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';

@Injectable()
export class ByCardRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getByCard(
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<ByCardResponseDto> {
    const accounted = await this.prisma.accounted.findFirst({
      select: {
        id: true,
        companyId: true,
        partnerCompanyRegistrationNumber: true,
        accountedType: true,
        accountedDate: true,
        accountedSubject: true,
        accountedMethod: true,
        memo: true,
        byCard: {
          select: {
            cardAmount: true,
            totalAmount: true,
            approvalNumber: true,
            isCharge: true,
            chargeAmount: true,
            card: {
              select: {
                id: true,
                cardName: true,
                cardCompany: true,
                cardNumber: true,
              },
            },
            bankAccount: {
              select: {
                id: true,
                accountName: true,
                accountNumber: true,
                bank: true,
              },
            },
          },
        },
      },
      where: {
        companyId,
        accountedType,
        id: accountedId,
        isDeleted: false,
        byCard: {
          isDeleted: false,
        },
      },
    });

    const partner = await this.prisma.partner.findUnique({
      where: {
        companyId_companyRegistrationNumber: {
          companyId,
          companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
        },
      },
    });

    return {
      companyId: accounted.companyId,
      companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
      accountedId: accounted.id,
      accountedType: accounted.accountedType,
      accountedDate: accounted.accountedDate.toISOString(),
      accountedSubject: accounted.accountedSubject,
      accountedMethod: accounted.accountedMethod,
      amount: accounted.byCard.cardAmount,
      memo: accounted.memo,
      partnerNickName: partner.partnerNickName,
      cardId: accounted.byCard.card?.id || null,
      cardName: accounted.byCard.card?.cardName || null,
      cardNumber: accounted.byCard.card?.cardNumber || null,
      cardCompany: accounted.byCard.card?.cardCompany || null,
      bankAccountId: accounted.byCard.bankAccount?.id || null,
      accountName: accounted.byCard.bankAccount?.accountName || null,
      bankAccountNumber: accounted.byCard.bankAccount?.accountNumber || null,
      bankComapny: accounted.byCard.bankAccount?.bank || null,
      totalAmount: accounted.byCard.totalAmount,
      chargeAmount: accounted.byCard.chargeAmount,
      isCharge: accounted.byCard.isCharge,
      approvalNumber: accounted.byCard.approvalNumber,
    };
  }
}
