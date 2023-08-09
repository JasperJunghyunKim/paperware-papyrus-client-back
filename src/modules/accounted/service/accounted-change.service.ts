import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountedType,
  Bank,
  EndorsementType,
  SecurityStatus,
  SecurityType,
  Subject,
} from '@prisma/client';
import { Selector } from 'src/common';
import { PrismaTransaction } from 'src/common/types';
import { PrismaService } from 'src/core';

@Injectable()
export class AccountedChangeService {
  constructor(private readonly prisma: PrismaService) {}

  // 등록

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
      if (!bankAccount)
        throw new NotFoundException(`존재하지 않는 계좌 정보입니다.`);

      return await tx.accounted.create({
        data: {
          company: {
            connect: {
              id: params.companyId,
            },
          },
          companyRegistrationNumber: params.companyRegistrationNumber,
          accountedType: params.accountedType,
          accountedSubject: params.accountedSubject,
          accountedMethod: 'ACCOUNT_TRANSFER',
          accountedDate: params.accountedDate,
          memo: params.memo || '',
          byBankAccount: {
            create: {
              amount: params.amount,
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

  async createBySecurity(params: {
    companyId: number;
    accountedType: AccountedType;
    companyRegistrationNumber: string;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo?: string;
    endorsementType: EndorsementType; // 배서구분
    endorsement?: string; // 배서자
    securityId?: number; // 지급시 필수
    security?: {
      securityType: SecurityType;
      securitySerial: string;
      securityAmount: number;
      drawedDate?: string;
      drawedBank?: Bank;
      drawedBankBranch?: string;
      drawedRegion?: string;
      drawer?: string;
      maturedDate?: string;
      payingBank?: Bank;
      payingBankBranch?: string;
      payer?: string;
      memo?: string;
    }; // 수금시 필수
  }) {
    return await this.prisma.$transaction(async (tx) => {
      if (params.accountedType === AccountedType.PAID) {
        // 지급일때
        const [security]: {
          id: number;
          securityStatus: SecurityStatus;
        }[] = await tx.$queryRaw`
          SELECT *
            FROM Security 
           WHERE id = ${params.securityId}
             AND companyId = ${params.companyId}
             AND isDeleted = ${false}
  
           FOR UPDATE;
        `;
        if (!security)
          throw new BadRequestException(`존재하지 않는 유가증권 입니다.`);
        if (security.securityStatus !== 'NONE')
          throw new ConflictException(`사용할 수 없는 유가증권 입니다.`);

        const accounted = await tx.accounted.create({
          data: {
            company: {
              connect: {
                id: params.companyId,
              },
            },
            companyRegistrationNumber: params.companyRegistrationNumber,
            accountedType: params.accountedType,
            accountedSubject: params.accountedSubject,
            accountedMethod: 'PROMISSORY_NOTE',
            accountedDate: params.accountedDate,
            memo: params.memo || '',
            bySecurity: {
              create: {
                securityId: params.securityId,
                amount: params.amount,
              },
            },
          },
          select: {
            id: true,
          },
        });

        return accounted;
      } else {
        return await tx.accounted.create({
          select: {
            id: true,
          },
          data: {
            company: {
              connect: {
                id: params.companyId,
              },
            },
            companyRegistrationNumber: params.companyRegistrationNumber,
            accountedType: params.accountedType,
            accountedSubject: params.accountedSubject,
            accountedMethod: 'PROMISSORY_NOTE',
            accountedDate: params.accountedDate,
            memo: params.memo || '',
            bySecurity: {
              create: {
                endorsement: params.endorsement || '',
                endorsementType: params.endorsementType,
                amount: params.amount,
                security: {
                  create: {
                    securityType: params.security.securityType,
                    securitySerial: params.security.securitySerial,
                    securityAmount: params.security.securityAmount,
                    securityStatus: 'NONE',
                    drawedDate: params.security.drawedDate,
                    drawedBank: params.security.drawedBank,
                    drawedBankBranch: params.security.drawedBankBranch || '',
                    drawedRegion: params.security.drawedRegion || '',
                    drawer: params.security.drawer || '',
                    maturedDate: params.security.maturedDate,
                    payingBank: params.security.payingBank,
                    payingBankBranch: params.security.payingBankBranch || '',
                    payer: params.security.payer || '',
                    memo: params.memo || '',
                    company: {
                      connect: {
                        id: params.companyId,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }
    });
  }

  async createByCash(params: {
    companyId: number;
    accountedType: AccountedType;
    companyRegistrationNumber: string;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo: string | null;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      return await tx.accounted.create({
        data: {
          company: {
            connect: {
              id: params.companyId,
            },
          },
          companyRegistrationNumber: params.companyRegistrationNumber,
          accountedType: params.accountedType,
          accountedSubject: params.accountedSubject,
          accountedMethod: 'CASH',
          accountedDate: params.accountedDate,
          memo: params.memo || '',
          byCash: {
            create: {
              amount: params.amount,
            },
          },
        },
        select: {
          id: true,
        },
      });
    });
  }

  async createByCard(params: {
    companyId: number;
    accountedType: AccountedType;
    companyRegistrationNumber: string;
    accountedDate: string;
    accountedSubject: Subject;
    cardAmount: number;
    vatPrice: number;
    isCharge: boolean;
    memo: string | null;
    approvalNumber: string | null;
    cardId: number | null;
    bankAccountId: number | null;
  }) {
    const cardAmount = params.cardAmount;
    const vatPrice = params.vatPrice || 0;
    const amount =
      cardAmount +
      (params.isCharge
        ? params.accountedType === 'PAID'
          ? -vatPrice
          : vatPrice
        : 0);

    return await this.prisma.$transaction(async (tx) => {
      // 카드, 계좌정보 확인
      if (params.accountedType === 'PAID') {
        const card = await tx.card.findFirst({
          where: {
            id: params.cardId,
            companyId: params.companyId,
            isDeleted: false,
          },
        });
        if (!card)
          throw new BadRequestException(`존재하지 않는 카드 정보입니다.`);
      } else {
        const bankAccount = await tx.bankAccount.findFirst({
          where: {
            id: params.bankAccountId,
            companyId: params.companyId,
            isDeleted: false,
          },
        });
        if (!bankAccount)
          throw new BadRequestException(`존재하지 않는 계좌 정보입니다.`);
      }

      return await tx.accounted.create({
        select: {
          id: true,
        },
        data: {
          // TODO: company, partner 확인
          company: {
            connect: {
              id: params.companyId,
            },
          },
          companyRegistrationNumber: params.companyRegistrationNumber,
          accountedType: params.accountedType,
          accountedSubject: params.accountedSubject,
          accountedMethod: 'CARD_PAYMENT',
          accountedDate: params.accountedDate,
          memo: params.memo || '',
          byCard: {
            create: {
              cardAmount,
              isCharge: params.isCharge,
              vatPrice,
              amount,
              approvalNumber: params.approvalNumber || '',
              card:
                params.accountedType === 'PAID'
                  ? {
                      connect: {
                        id: params.cardId,
                      },
                    }
                  : undefined,
              bankAccount:
                params.accountedType === 'COLLECTED'
                  ? {
                      connect: {
                        id: params.bankAccountId,
                      },
                    }
                  : undefined,
            },
          },
        },
      });
    });
  }

  async createByOffset(params: {
    companyId: number;
    companyRegistrationNumber: string;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo: string | null;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const byOffsetPair = await tx.byOffsetPair.create({
        data: {},
      });

      const collected = await tx.accounted.create({
        data: {
          company: {
            connect: {
              id: params.companyId,
            },
          },
          companyRegistrationNumber: params.companyRegistrationNumber,
          accountedType: 'COLLECTED',
          accountedSubject: params.accountedSubject,
          accountedMethod: 'OFFSET',
          accountedDate: params.accountedDate,
          memo: params.memo || '',
          byOffset: {
            create: {
              amount: params.amount,
              byOffsetPairId: byOffsetPair.id,
            },
          },
        },
        select: {
          id: true,
          byOffset: {
            select: {
              id: true,
            },
          },
        },
      });

      const paid = await tx.accounted.create({
        data: {
          company: {
            connect: {
              id: params.companyId,
            },
          },
          companyRegistrationNumber: params.companyRegistrationNumber,
          accountedType: 'PAID',
          accountedSubject: params.accountedSubject,
          accountedMethod: 'OFFSET',
          accountedDate: params.accountedDate,
          memo: params.memo || '',
          byOffset: {
            create: {
              amount: params.amount,
              byOffsetPairId: byOffsetPair.id,
            },
          },
        },
        select: {
          id: true,
          byOffset: {
            select: {
              id: true,
            },
          },
        },
      });
    });
  }

  async createByEtc(params: {
    companyId: number;
    accountedType: AccountedType;
    companyRegistrationNumber: string;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo: string | null;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      return await tx.accounted.create({
        data: {
          company: {
            connect: {
              id: params.companyId,
            },
          },
          companyRegistrationNumber: params.companyRegistrationNumber,
          accountedType: params.accountedType,
          accountedSubject: params.accountedSubject,
          accountedMethod: 'ETC',
          accountedDate: params.accountedDate,
          memo: params.memo || '',
          byEtc: {
            create: {
              amount: params.amount,
            },
          },
        },
        select: {
          id: true,
        },
      });
    });
  }

  // 수정

  private async getAccounted(
    tx: PrismaTransaction,
    companyId: number,
    accountedId: number,
  ) {
    return await this.prisma.accounted.findFirst({
      select: Selector.ACCOUNTED,
      where: {
        id: accountedId,
        companyId,
        isDeleted: false,
      },
    });
  }

  async updateByBankAccount(params: {
    companyId: number;
    accountedId: number;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo: string | null;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const accounted = await this.getAccounted(
        tx,
        params.companyId,
        params.accountedId,
      );
      if (!accounted)
        throw new NotFoundException(`존재하지 않는 회계정보입니다.`);
      if (accounted.accountedMethod !== 'ACCOUNT_TRANSFER')
        throw new ConflictException(`회계수단 에러`);

      await tx.byBankAccount.update({
        where: {
          id: accounted.byBankAccount.id,
        },
        data: {
          amount: params.amount,
        },
      });

      return await tx.accounted.update({
        select: {
          id: true,
        },
        where: {
          id: params.accountedId,
        },
        data: {
          accountedDate: params.accountedDate,
          accountedSubject: params.accountedSubject,
          memo: params.memo || '',
        },
      });
    });
  }

  async updateByCash(params: {
    companyId: number;
    accountedId: number;
    accountedDate: string;
    accountedSubject: Subject;
    amount: number;
    memo: string | null;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const accounted = await this.getAccounted(
        tx,
        params.companyId,
        params.accountedId,
      );
      if (!accounted)
        throw new NotFoundException(`존재하지 않는 회계정보입니다.`);
      if (accounted.accountedMethod !== 'CASH')
        throw new ConflictException(`회계수단 에러`);

      await tx.byCash.update({
        where: {
          id: accounted.byCash.id,
        },
        data: {
          amount: params.amount,
        },
      });

      return await tx.accounted.update({
        select: {
          id: true,
        },
        where: {
          id: params.accountedId,
        },
        data: {
          accountedDate: params.accountedDate,
          accountedSubject: params.accountedSubject,
          memo: params.memo || '',
        },
      });
    });
  }
}
