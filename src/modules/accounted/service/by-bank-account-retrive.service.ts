import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { ByBankAccountItemResponseDto } from '../api/dto/bank-account.response';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';

@Injectable()
export class ByBankAccountRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getByBankAccount(
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<ByBankAccountItemResponseDto> {
    const accounted = await this.prisma.accounted.findFirst({
      select: {
        id: true,
        partnerCompanyRegistrationNumber: true,
        accountedType: true,
        accountedDate: true,
        accountedSubject: true,
        accountedMethod: true,
        memo: true,
        byBankAccount: {
          select: {
            id: true,
            bankAccountId: true,
            bankAccountAmount: true,
            bankAccount: {
              select: {
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
        byBankAccount: {
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
      companyId,
      companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
      accountedId: accounted.id,
      accountedType: accounted.accountedType,
      accountedDate: accounted.accountedDate.toISOString(),
      accountedSubject: accounted.accountedSubject,
      accountedMethod: accounted.accountedMethod,
      amount: accounted.byBankAccount.bankAccountAmount,
      memo: accounted.memo,
      partnerNickName: partner.partnerNickName || '',
      bankAccountId: accounted.byBankAccount.bankAccountId,
      accountName: accounted.byBankAccount.bankAccount.accountName,
      accountNumber: accounted.byBankAccount.bankAccount.accountNumber,
      bankComapny: accounted.byBankAccount.bankAccount.bank,
    };
  }
}
