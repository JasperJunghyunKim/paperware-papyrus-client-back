import { Injectable } from '@nestjs/common';
import { from, lastValueFrom, map } from 'rxjs';
import { PrismaService } from 'src/core';
import {
  BankAccountItemResponseDto,
  BankAccountListResponseDto,
} from '../api/dto/bank-account.response';

@Injectable()
export class BankAccountRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getBankAccountList(
    companyId: number,
  ): Promise<BankAccountListResponseDto> {
    return await lastValueFrom(
      from(
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
        }),
      ).pipe(
        map((bankAccountList) => {
          return {
            items: bankAccountList.map((bankAccount) => {
              return {
                accountId: bankAccount.id,
                bankComapny: bankAccount.bank,
                accountName: bankAccount.accountName,
                accountType: bankAccount.accountType,
                accountNumber: bankAccount.accountNumber,
                accountHolder: bankAccount.accountHolder,
              };
            }),
            total: bankAccountList.length,
          };
        }),
      ),
    );
  }

  async getBankAccountItem(
    bankAccountId: number,
  ): Promise<BankAccountItemResponseDto> {
    return await lastValueFrom(
      from(
        this.prisma.bankAccount.findFirst({
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
            isDeleted: false,
          },
        }),
      ).pipe(
        map((bankAccount) => {
          return {
            accountId: bankAccount.id,
            bankComapny: bankAccount.bank,
            accountName: bankAccount.accountName,
            accountType: bankAccount.accountType,
            accountNumber: bankAccount.accountNumber,
            accountHolder: bankAccount.accountHolder,
          };
        }),
      ),
    );
  }
}
