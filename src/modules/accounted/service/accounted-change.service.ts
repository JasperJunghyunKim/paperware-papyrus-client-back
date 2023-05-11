import { Injectable } from '@nestjs/common';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { CashRequest } from '../api/dto/cash.request';
import { EtcRequest } from '../api/dto/etc.request';

@Injectable()
export class AccountedChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createCash(cashRequest: CashRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            partner: {
              connect: {
                id: cashRequest.partnerId,
              },
            },
            accountedType: cashRequest.accountedType,
            accountedSubject: cashRequest.accountedSubject,
            accountedMethod: cashRequest.accountedMethod,
            accountedDate: cashRequest.accountedDate,
            memo: cashRequest.memo,
            byCash: {
              create: {
                cashAmount: cashRequest.amount,
              }
            },
          },
          select: {
            id: true,
          },
        })
      )
    );
  }

  async updateCash(accountedId: number, cashRequest: CashRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            partner: {
              connect: {
                id: cashRequest.partnerId,
              },
            },
            accountedType: cashRequest.accountedType,
            accountedSubject: cashRequest.accountedSubject,
            accountedMethod: cashRequest.accountedMethod,
            accountedDate: cashRequest.accountedDate,
            memo: cashRequest.memo,
            byCash: {
              update: {
                cashAmount: cashRequest.amount,
              }
            }
          },
          where: {
            id: accountedId
          }
        })
      )
    );
  }

  async deleteCash(accountedId: number): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byCash: true,
      },
      where: { id: accountedId }
    });

    await lastValueFrom(
      from(
        this.prisma.byCash.update({
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
          where: { id: result.byCash.id }
        })
      )
    );
  }

  async createEtc(etcRequest: EtcRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            partner: {
              connect: {
                id: etcRequest.partnerId,
              },
            },
            accountedType: etcRequest.accountedType,
            accountedSubject: etcRequest.accountedSubject,
            accountedMethod: etcRequest.accountedMethod,
            accountedDate: etcRequest.accountedDate,
            memo: etcRequest.memo,
            byEtc: {
              create: {
                etcAmount: etcRequest.amount,
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

  async updateEtc(accountedId: number, etcRequest: EtcRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            partner: {
              connect: {
                id: etcRequest.partnerId,
              },
            },
            accountedType: etcRequest.accountedType,
            accountedSubject: etcRequest.accountedSubject,
            accountedMethod: etcRequest.accountedMethod,
            accountedDate: etcRequest.accountedDate,
            memo: etcRequest.memo,
            byEtc: {
              update: {
                etcAmount: etcRequest.amount,
              }
            }
          },
          select: {
            id: true,
          },
          where: {
            id: accountedId
          }
        })
      )
    );
  }

  async deleteEtc(accountedId: number): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byEtc: true,
      },
      where: { id: accountedId }
    });

    await lastValueFrom(
      from(
        this.prisma.byEtc.update({
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
          where: { id: result.byEtc.id }
        })
      )
    );
  }
}
