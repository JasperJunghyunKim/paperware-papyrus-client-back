import { Injectable, NotFoundException } from '@nestjs/common';
import { from, lastValueFrom, map } from 'rxjs';
import { Model } from 'src/@shared';
import { PrismaService } from 'src/core';

@Injectable()
export class BankAccountRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getBankAccountList(
    companyId: number,
    skip: number,
    take: number,
  ): Promise<{
    items: Model.BankAccount[];
    total: number;
  }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.bankAccount.findMany({
        select: {
          id: true,
          bank: true,
          accountName: true,
          accountType: true,
          accountNumber: true,
          accountHolder: true,
        },
        where: {
          companyId,
          isDeleted: false,
        },
        skip,
        take,
      }),
      this.prisma.bankAccount.count({
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

  async getBankAccountItem(
    companyId: number,
    bankAccountId: number,
  ): Promise<Model.BankAccount> {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      select: {
        id: true,
        bank: true,
        accountName: true,
        accountType: true,
        accountNumber: true,
        accountHolder: true,
      },
      where: {
        id: bankAccountId,
        companyId,
        isDeleted: false,
      },
    });
    if (!bankAccount)
      throw new NotFoundException(`존재하지 않는 계좌 정보입니다.`);

    return bankAccount;
  }
}
