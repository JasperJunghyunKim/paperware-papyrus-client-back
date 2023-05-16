import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { from, lastValueFrom, map } from 'rxjs';
import { BankAccountResponseDto } from '../api/dto/bank-account.response';

@Injectable()
export class BankAccountRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getBankAccountList(companyId: number): Promise<BankAccountResponseDto[]> {
    return await lastValueFrom(from(
      this.prisma.bankAccount.findMany({
        select: {
          id: true,
          bankComapny: true,
          accountName: true,
          accountType: true,
          accountNumber: true,
          accountHolder: true,
        },
        where: {
          companyId,
          isDeleted: true,
        }
      })
    ).pipe(
      map((bankAccountList) => {
        return bankAccountList.map((bankAccount) => {
          return {
            accountId: bankAccount.id,
            bankComapny: bankAccount.bankComapny,
            accountName: bankAccount.accountName,
            accountType: bankAccount.accountType,
            accountNumber: bankAccount.accountNumber,
            accountHolder: bankAccount.accountHolder,
          }
        })
      }
      ))
    );
  }
}
