import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountedType, Subject } from '@prisma/client';
import { PrismaService } from 'src/core';

@Injectable()
export class AccountedChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createByBankAccount(params: {
    companyId: number;
    accountedType: AccountedType;
    companyRegistrationNumber: string;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo: string | null;
    bankAccountId: number;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const bankAccount = await tx.bankAccount.findFirst({
        where: {
          id: params.bankAccountId,
          companyId: params.companyId,
          isDeleted: false,
        },
      });
      if (bankAccount)
        throw new NotFoundException(`존재하지 않는 계좌 정보입니다.`);

      return await tx.accounted.create({
        data: {
          company: {
            connect: {
              id: params.companyId,
            },
          },
          partnerCompanyRegistrationNumber: params.companyRegistrationNumber,
          accountedType: params.accountedType,
          accountedSubject: params.accountedSubject,
          accountedMethod: 'ACCOUNT_TRANSFER',
          accountedDate: params.accountedDate,
          memo: params.memo || '',
          byBankAccount: {
            create: {
              bankAccountAmount: params.amount,
              bankAccount: {
                connect: {
                  id: params.bankAccountId,
                },
              },
            },
          },
        },
        select: {
          id: true,
        },
      });
    });
  }
}
