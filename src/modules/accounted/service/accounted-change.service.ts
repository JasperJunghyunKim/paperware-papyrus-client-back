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
import { SecurityChangeService } from 'src/modules/inhouse/service/security-change.service';

@Injectable()
export class AccountedChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityChangeService: SecurityChangeService,
  ) {}

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
    memo: string | null;
    endorsementType: EndorsementType; // 배서구분
    endorsement: string | null; // 배서자
    securityId: number | null; // 지급시 필수
    security: {
      securityType: SecurityType;
      securitySerial: string;
      securityAmount: number;
      drawedDate: string | null;
      drawedBank: Bank | null;
      drawedBankBranch: string | null;
      drawedRegion: string | null;
      drawer: string | null;
      maturedDate: string | null;
      payingBank: Bank | null;
      payingBankBranch: string | null;
      payer: string | null;
      memo: string | null;
    } | null; // 수금시 필수
  }) {
    return await this.prisma.$transaction(async (tx) => {
      if (params.accountedType === AccountedType.PAID) {
        // 지급일때
        const security =
          await this.securityChangeService.getSecurityForUpdateTx(
            tx,
            params.securityId,
            params.companyId,
          );

        if (!security)
          throw new NotFoundException(`존재하지 않는 유가증권 정보입니다.`);

        if (security.securityStatus !== 'NONE' || security.paidBySecurityId)
          throw new ConflictException(`이미 사용된 유가증권입니다.`);

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
      select: {
        ...Selector.ACCOUNTED,
        byOffset: {
          include: {
            offsetPair: {
              include: {
                byOffsets: {
                  include: {
                    accounted: true,
                  },
                },
              },
            },
          },
        },
      },
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

  async updateByCard(params: {
    companyId: number;
    accountedId: number;
    accountedDate: string;
    accountedSubject: Subject;
    cardAmount: number;
    vatPrice: number;
    isCharge: boolean;
    memo: string | null;
    approvalNumber: string | null;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const accounted = await this.getAccounted(
        tx,
        params.companyId,
        params.accountedId,
      );
      if (!accounted)
        throw new NotFoundException(`존재하지 않는 회계정보입니다.`);
      if (accounted.accountedMethod !== 'CARD_PAYMENT')
        throw new ConflictException(`회계수단 에러`);

      const cardAmount = params.cardAmount;
      const vatPrice = params.vatPrice || 0;
      const amount =
        cardAmount +
        (params.isCharge
          ? accounted.accountedType === 'PAID'
            ? -vatPrice
            : vatPrice
          : 0);

      await tx.byCard.update({
        where: {
          id: accounted.byCard.id,
        },
        data: {
          cardAmount,
          vatPrice,
          amount,
          approvalNumber: params.approvalNumber || '',
          isCharge: params.isCharge,
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

  async updateBySecurity(params: {
    companyId: number;
    accountedId: number;
    accountedDate: string;
    accountedSubject: Subject;
    memo: string | null;
    endorsementType: EndorsementType | null; // 배서구분
    endorsement: string | null; // 배서자
    security: {
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
    } | null; // 수금시 수증가능
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const accounted = await this.getAccounted(
        tx,
        params.companyId,
        params.accountedId,
      );
      if (!accounted)
        throw new NotFoundException(`존재하지 않는 회계정보입니다.`);
      if (accounted.accountedMethod !== 'PROMISSORY_NOTE')
        throw new ConflictException(`회계수단 에러`);

      if (accounted.accountedType === 'COLLECTED') {
        // 수금일때 유가증권관련 정보 수정
        if (!params.endorsementType)
          throw new BadRequestException(`배서구분을 입력하셔야합니다.`);

        const security = accounted.bySecurity.security;
        const paid =
          security.bySecurities.find(
            (bs) => bs.accounted.accountedType === 'PAID',
          ) || null;
        if (!paid && security.securityStatus === 'NONE') {
          // 지급에 사용되지 않고, 기본상태일때에만 유가증권 정보 수정가능
          await tx.security.update({
            where: {
              id: security.id,
            },
            data: {
              securityType: params.security.securityType,
              securitySerial: params.security.securitySerial,
              securityAmount: params.security.securityAmount,
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
            },
          });
        }

        await tx.bySecurity.update({
          where: {
            id: accounted.bySecurity.id,
          },
          data: {
            endorsementType: params.endorsementType,
            endorsement: params.endorsement || '',
          },
        });
      }

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

  async updateByOffset(params: {
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
      if (accounted.accountedMethod !== 'OFFSET')
        throw new ConflictException(`회계수단 에러`);

      const pair = accounted.byOffset.offsetPair;

      await tx.byOffset.updateMany({
        where: {
          id: {
            in: pair.byOffsets.map((offset) => offset.id),
          },
        },
        data: {
          amount: params.amount,
        },
      });

      return await tx.accounted.updateMany({
        where: {
          id: {
            in: pair.byOffsets.map((offset) => offset.accounted.id),
          },
        },
        data: {
          accountedDate: params.accountedDate,
          accountedSubject: params.accountedSubject,
          memo: params.memo || '',
        },
      });
    });
  }

  async updateByEtc(params: {
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
      if (accounted.accountedMethod !== 'ETC')
        throw new ConflictException(`회계수단 에러`);

      await tx.byEtc.update({
        where: {
          id: accounted.byEtc.id,
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

  async delete(companyId: number, accountedId: number) {
    await this.prisma.$transaction(async (tx) => {
      const accounted = await this.getAccounted(tx, companyId, accountedId);
      if (!accounted)
        throw new NotFoundException(`존재하지 않는 회계정보입니다.`);

      // 유가증권 & 수금일때 유가증권 상태에따라 삭제가능여부 체크
      if (
        accounted.accountedMethod === 'PROMISSORY_NOTE' &&
        accounted.accountedType === 'COLLECTED'
      ) {
        const security = accounted.bySecurity.security;
        const paid =
          security.bySecurities.find(
            (bs) => bs.accounted.accountedType === 'PAID',
          ) || null;

        if (paid || security.securityStatus !== 'NONE')
          throw new ConflictException(`삭제불가능한 유가증권 상태입니다.`);
      }

      if (accounted.accountedMethod === 'OFFSET') {
        // 상계일때 수금, 지급 둘 다 삭제
        await tx.accounted.updateMany({
          where: {
            id: {
              in: accounted.byOffset.offsetPair.byOffsets.map(
                (bo) => bo.accounted.id,
              ),
            },
          },
          data: {
            isDeleted: true,
          },
        });
      } else {
        await tx.accounted.update({
          where: {
            id: accounted.id,
          },
          data: {
            isDeleted: true,
          },
        });
      }

      switch (accounted.accountedMethod) {
        case 'ACCOUNT_TRANSFER':
          await tx.byBankAccount.update({
            where: {
              id: accounted.byBankAccount.id,
            },
            data: {
              isDeleted: true,
            },
          });
          break;
        case 'CARD_PAYMENT':
          await tx.byCard.update({
            where: {
              id: accounted.byCard.id,
            },
            data: {
              isDeleted: true,
            },
          });
          break;
        case 'CASH':
          await tx.byCash.update({
            where: {
              id: accounted.byCash.id,
            },
            data: {
              isDeleted: true,
            },
          });
          break;
        case 'OFFSET':
          await tx.byOffset.updateMany({
            where: {
              id: {
                in: accounted.byOffset.offsetPair.byOffsets.map((bo) => bo.id),
              },
            },
            data: {
              isDeleted: true,
            },
          });
          break;
        case 'PROMISSORY_NOTE':
          if (accounted.accountedType === 'COLLECTED') {
            // 수금 => 유가증권 삭제
            const collected =
              accounted.bySecurity.security.bySecurities.find(
                (bs) => bs.accounted.accountedType === 'COLLECTED',
              ) || null;
            await tx.bySecurity.update({
              where: {
                id: collected.id,
              },
              data: {
                isDeleted: true,
              },
            });
            await tx.security.update({
              where: {
                id: collected.securityId,
              },
              data: {
                isDeleted: true,
              },
            });
          } else {
            // 지급 => 유가증권 상태 되돌림
            const paid =
              accounted.bySecurity.security.bySecurities.find(
                (bs) => bs.accounted.accountedType === 'PAID',
              ) || null;
            await tx.bySecurity.update({
              where: {
                id: paid.id,
              },
              data: {
                isDeleted: true,
              },
            });
          }
          break;
        case 'ETC':
          await tx.byEtc.update({
            where: {
              id: accounted.byEtc.id,
            },
            data: {
              isDeleted: true,
            },
          });
          break;
      }
    });
  }
}
