import { Injectable } from '@nestjs/common';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { PaidCashRequest } from '../api/dto/cash.request';
import { PaidEtcRequest } from '../api/dto/etc.request';

@Injectable()
export class AccountedChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createCash(paidCashRequest: PaidCashRequest): Promise<void> {
    const result = await lastValueFrom(
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
            }
          },
          select: {
            id: true,
          },
        })
      )
    );

    console.log(result);
  }

  async updateCash(paidId: number, paidCashRequest: PaidCashRequest): Promise<void> {
    const result = await lastValueFrom(
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
            id: paidId
          }
        })
      )
    );

    console.log(result);
  }
  async deleteCash(paidId: number): Promise<void> {
    const result = await lastValueFrom(
      from(
        this.prisma.accounted.delete({ where: { id: paidId } })
      )
    );

    console.log(result);
  }

  async createEtc(paidEtcRequest: PaidEtcRequest): Promise<void> {
    const result = await lastValueFrom(
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

    console.log(result);
  }
  async updateEtc(paidId: number, paidEtcRequest: PaidEtcRequest): Promise<void> {
    const result = await lastValueFrom(
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
            id: paidId
          }
        })
      )
    );

    console.log(result);
  }
  async deleteEtc(paidId: number): Promise<void> {
    const result = await lastValueFrom(
      from(
        this.prisma.accounted.delete({ where: { id: paidId } })
      )
    );

    console.log(result);
  }
}
