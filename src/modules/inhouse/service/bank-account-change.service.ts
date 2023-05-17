import { Injectable } from '@nestjs/common';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { BankAccountCreateRequestDto, BankAccountUpdateRequestDto } from '../api/dto/bank-account.request';

@Injectable()
export class BankAccountChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createBankAccount(companyId: number, bankAccountCreateRequestDto: BankAccountCreateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.bankAccount.create({
          data: {
            bankComapny: bankAccountCreateRequestDto.bankComapny,
            accountName: bankAccountCreateRequestDto.accountName,
            accountType: bankAccountCreateRequestDto.accountType,
            accountNumber: bankAccountCreateRequestDto.accountNumber,
            accountHolder: bankAccountCreateRequestDto.accountHolder,
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

  async updateBankAccount(bankAccountId: number, bankAccountUpdateRequest: BankAccountUpdateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.bankAccount.update({
          data: {
            accountName: bankAccountUpdateRequest.accountName,
          },
          select: {
            id: true,
          },
          where: {
            id: bankAccountId,
          }
        })
      )
    );
  }

  async deleteBankAccount(bankAccountId: number): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.bankAccount.update({
          data: {
            isDeleted: true,
          },
          where: {
            id: bankAccountId
          }
        })
      )
    );
  }
}
