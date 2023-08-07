import { Injectable, NotFoundException } from '@nestjs/common';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import {
  BankAccountCreateRequestDto,
  BankAccountUpdateRequestDto,
} from '../api/dto/bank-account.request';
import { AccountType, Bank } from '@prisma/client';

@Injectable()
export class BankAccountChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createBankAccount(params: {
    companyId: number;
    bank: Bank;
    accountName: string;
    accountType: AccountType;
    accountNumber: string;
    accountHolder: string;
  }) {
    return await this.prisma.bankAccount.create({
      data: {
        bank: params.bank,
        accountName: params.accountName,
        accountType: params.accountType,
        accountNumber: params.accountNumber,
        accountHolder: params.accountHolder,
        company: {
          connect: {
            id: params.companyId,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  async updateBankAccount(params: {
    companyId: number;
    bankAccountId: number;
    accountName: string;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const account = await tx.bankAccount.findFirst({
        where: {
          id: params.bankAccountId,
          companyId: params.companyId,
          isDeleted: false,
        },
      });
      if (!account)
        throw new NotFoundException(`존재하지 않는 은행계좌 정보입니다.`);

      await tx.bankAccount.update({
        data: {
          accountName: params.accountName,
        },
        select: {
          id: true,
        },
        where: {
          id: params.bankAccountId,
        },
      });
    });
  }

  async deleteBankAccount(
    companyId: number,
    bankAccountId: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const account = await tx.bankAccount.findFirst({
        where: {
          id: bankAccountId,
          companyId,
          isDeleted: false,
        },
      });
      if (!account)
        throw new NotFoundException(`존재하지 않는 은행계좌 정보입니다.`);

      await tx.bankAccount.update({
        where: {
          id: bankAccountId,
        },
        data: {
          isDeleted: true,
        },
      });
    });
  }
}
