import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { ByBankAccountCreateRequestDto } from '../api/dto/bank-account.request';
import { ByBankAccountUpdateRequestDto } from '../api/dto/bank-account.request';

@Injectable()
export class ByBankAccountChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createBankAccount(accountedType: AccountedType, byBankCreateRequest: ByBankAccountCreateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            partner: {
              connect: {
                companyId_companyRegistrationNumber: {
                  companyRegistrationNumber: byBankCreateRequest.companyRegistrationNumber,
                  companyId: byBankCreateRequest.companyId,
                }
              },
            },
            accountedType,
            accountedSubject: byBankCreateRequest.accountedSubject,
            accountedMethod: byBankCreateRequest.accountedMethod,
            accountedDate: byBankCreateRequest.accountedDate,
            memo: byBankCreateRequest.memo,
            byBankAccount: {
              create: {
                bankAccountAmount: byBankCreateRequest.amount,
                bankAccount: {
                  connect: {
                    id: byBankCreateRequest.bankAccountId,
                  },
                },
              }
            },
          },
        })
      )
    );
  }

  async updateBankAccount(accountedType: AccountedType, accountedId: number, byBankUpdateRequest: ByBankAccountUpdateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            accountedType,
            accountedSubject: byBankUpdateRequest.accountedSubject,
            accountedMethod: byBankUpdateRequest.accountedMethod,
            accountedDate: byBankUpdateRequest.accountedDate,
            memo: byBankUpdateRequest.memo,
            byBankAccount: {
              update: {
                bankAccountAmount: byBankUpdateRequest.amount,
                bankAccount: {
                  connect: {
                    id: byBankUpdateRequest.bankAccountId,
                  },
                },
              }
            },
          },
          where: {
            id: accountedId
          }
        })
      )
    );
  }

  async deleteBankAccount(accountedType: AccountedType, accountedId: number): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byBankAccount: true,
      },
      where: {
        id: accountedId,
        accountedType,
      }
    });

    await lastValueFrom(
      from(
        this.prisma.byBankAccount.update({
          data: {
            isDeleted: true,
            accounted: {
              update: {
                isDeleted: true,
              }
            }
          },
          include: {
            accounted: true,
          },
          where: {
            id: result.byBankAccount.id,
          }
        })
      )
    );
  }
}
