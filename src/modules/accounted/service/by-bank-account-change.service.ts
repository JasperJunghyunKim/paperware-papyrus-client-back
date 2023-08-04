import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import {
  ByBankAccountCreateRequestDto,
  ByBankAccountUpdateRequestDto,
} from '../api/dto/bank-account.request';

@Injectable()
export class ByBankAccountChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createBankAccount(
    companyId: number,
    accountedType: AccountedType,
    byBankCreateRequest: ByBankAccountCreateRequestDto,
  ): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            // TODO: company / partnerCompanyRegistrationNumber 데이터 확인
            company: {
              connect: {
                id: companyId,
              },
            },
            partnerCompanyRegistrationNumber:
              byBankCreateRequest.companyRegistrationNumber,
            accountedType,
            accountedSubject: byBankCreateRequest.accountedSubject,
            accountedMethod: 'ACCOUNT_TRANSFER',
            accountedDate: byBankCreateRequest.accountedDate,
            memo: byBankCreateRequest.memo || '',
            byBankAccount: {
              create: {
                bankAccountAmount: byBankCreateRequest.amount,
                bankAccount: {
                  connect: {
                    id: byBankCreateRequest.bankAccountId,
                  },
                },
              },
            },
          },
        }),
      ),
    );
  }

  async updateBankAccount(
    accountedType: AccountedType,
    accountedId: number,
    byBankUpdateRequest: ByBankAccountUpdateRequestDto,
  ): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            accountedType,
            accountedSubject: byBankUpdateRequest.accountedSubject,
            accountedDate: byBankUpdateRequest.accountedDate,
            memo: byBankUpdateRequest.memo || null,
            byBankAccount: {
              update: {
                bankAccountAmount: byBankUpdateRequest.amount,
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

  async deleteBankAccount(
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byBankAccount: true,
      },
      where: {
        id: accountedId,
        accountedType,
      },
    });

    await lastValueFrom(
      from(
        this.prisma.byBankAccount.update({
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
            id: result.byBankAccount.id,
          },
        }),
      ),
    );
  }
}
