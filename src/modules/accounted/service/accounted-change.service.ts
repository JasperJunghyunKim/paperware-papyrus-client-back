import { Injectable } from '@nestjs/common';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { PaidCashRequest } from '../api/dto/cash.request';
import { PaidEtcRequest } from '../api/dto/etc.request';

@Injectable()
export class AccountedChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createCash(paidCashRequest: PaidCashRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            partner: {
              connect: {
                id: paidCashRequest.partnerId,
              },
            },
            accountedType: 'PAID',
            accountedSubject: paidCashRequest.accountedSubject,
            accountedMethod: paidCashRequest.accountedMethod,
            accountedDate: paidCashRequest.accountedDate,
            memo: paidCashRequest.memo,
            byCash: {
              create: {
                cashAmount: paidCashRequest.amount,
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

  async updateCash(accountedId: number, paidCashRequest: PaidCashRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            partner: {
              connect: {
                id: paidCashRequest.partnerId,
              },
            },
            accountedType: 'PAID',
            accountedSubject: paidCashRequest.accountedSubject,
            accountedMethod: paidCashRequest.accountedMethod,
            accountedDate: paidCashRequest.accountedDate,
            memo: paidCashRequest.memo,
            byCash: {
              update: {
                cashAmount: paidCashRequest.amount,
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

  async createEtc(paidEtcRequest: PaidEtcRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            partner: {
              connect: {
                id: paidEtcRequest.partnerId,
              },
            },
            accountedType: 'PAID',
            accountedSubject: paidEtcRequest.accountedSubject,
            accountedMethod: paidEtcRequest.accountedMethod,
            accountedDate: paidEtcRequest.accountedDate,
            memo: paidEtcRequest.memo,
            byEtc: {
              create: {
                etcAmount: paidEtcRequest.amount,
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

  async updateEtc(accountedId: number, paidEtcRequest: PaidEtcRequest): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            partner: {
              connect: {
                id: paidEtcRequest.partnerId,
              },
            },
            accountedType: 'PAID',
            accountedSubject: paidEtcRequest.accountedSubject,
            accountedMethod: paidEtcRequest.accountedMethod,
            accountedDate: paidEtcRequest.accountedDate,
            memo: paidEtcRequest.memo,
            byEtc: {
              update: {
                etcAmount: paidEtcRequest.amount,
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
