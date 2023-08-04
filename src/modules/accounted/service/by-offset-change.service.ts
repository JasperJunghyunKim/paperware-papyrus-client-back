import { Injectable } from '@nestjs/common';
import { AccountedType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/core';
import {
  ByOffsetCreateRequestDto,
  ByOffsetUpdateRequestDto,
} from '../api/dto/offset.request';

@Injectable()
export class ByOffsetChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createOffset(
    companyId: number,
    accountedType: AccountedType,
    byOffsetCreateRequest: ByOffsetCreateRequestDto,
  ): Promise<void> {
    const param: Prisma.AccountedCreateInput = {
      // TODO: company, partner 확인
      company: {
        connect: {
          id: companyId,
        },
      },
      partnerCompanyRegistrationNumber:
        byOffsetCreateRequest.companyRegistrationNumber,
      accountedType: 'PAID',
      accountedSubject: byOffsetCreateRequest.accountedSubject,
      accountedMethod: 'OFFSET',
      accountedDate: byOffsetCreateRequest.accountedDate,
      memo: byOffsetCreateRequest.memo || '',
      byOffset: {
        create: {
          offsetAmount: byOffsetCreateRequest.amount,
        },
      },
    };

    await this.prisma.$transaction(async (tx) => {
      const paid = await tx.accounted.create({
        data: {
          ...param,
          accountedType: 'PAID',
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

      const collected = await tx.accounted.create({
        data: {
          ...param,
          accountedType: 'COLLECTED',
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

      await tx.byOffsetPair.create({
        data: {
          byOffset: {
            connect: {
              id: paid.byOffset.id,
            },
          },
          paidId: paid.id,
          collectedId: collected.id,
        },
      });

      await tx.byOffsetPair.create({
        data: {
          byOffset: {
            connect: {
              id: collected.byOffset.id,
            },
          },
          paidId: paid.id,
          collectedId: collected.id,
        },
      });
    });
  }

  async updateOffset(
    accountedType: AccountedType,
    accountedId: number,
    byOffsetUpdateRequest: ByOffsetUpdateRequestDto,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      let result;
      if (accountedType === 'PAID') {
        result = await this.paidByCollected(accountedId);
      } else {
        result = await this.collectedByPaid(accountedId);
      }

      await tx.accounted.update({
        data: {
          accountedSubject: byOffsetUpdateRequest.accountedSubject,
          accountedDate: byOffsetUpdateRequest.accountedDate,
          memo: byOffsetUpdateRequest.memo || '',
          byOffset: {
            update: {
              offsetAmount: byOffsetUpdateRequest.amount,
            },
          },
        },
        where: {
          id: result[0].id,
        },
      });

      await tx.accounted.update({
        data: {
          accountedSubject: byOffsetUpdateRequest.accountedSubject,
          accountedDate: byOffsetUpdateRequest.accountedDate,
          memo: byOffsetUpdateRequest.memo || '',
          byOffset: {
            update: {
              offsetAmount: byOffsetUpdateRequest.amount,
            },
          },
        },
        where: {
          id: result[1].id,
        },
      });
    });
  }

  async deleteOffset(
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      let result;
      if (accountedType === 'PAID') {
        result = await this.paidByCollected(accountedId);
      } else {
        result = await this.collectedByPaid(accountedId);
      }

      await tx.accounted.update({
        data: {
          isDeleted: true,
          byOffset: {
            update: {
              isDeleted: true,
            },
          },
        },
        where: {
          id: result[0].id,
        },
      });

      await tx.accounted.update({
        data: {
          isDeleted: true,
          byOffset: {
            update: {
              isDeleted: true,
            },
          },
        },
        where: {
          id: result[1].id,
        },
      });
    });
  }

  private async paidByCollected(accountedId: number) {
    const paid = await this.prisma.accounted.findFirst({
      select: {
        id: true,
        byOffset: {
          include: {
            offsetPair: true,
          },
        },
      },
      where: {
        id: accountedId,
        accountedType: 'PAID',
      },
    });

    const collected = await this.prisma.accounted.findFirst({
      select: {
        id: true,
        byOffset: {
          include: {
            offsetPair: true,
          },
        },
      },
      where: {
        id: paid.byOffset.offsetPair.collectedId,
      },
    });

    return [paid, collected];
  }

  private async collectedByPaid(accountedId: number) {
    const collected = await this.prisma.accounted.findFirst({
      select: {
        id: true,
        byOffset: {
          include: {
            offsetPair: true,
          },
        },
      },
      where: {
        id: accountedId,
        accountedType: 'COLLECTED',
      },
    });

    const paid = await this.prisma.accounted.findFirst({
      select: {
        id: true,
        byOffset: {
          include: {
            offsetPair: true,
          },
        },
      },
      where: {
        id: collected.byOffset.offsetPair.paidId,
      },
    });

    return [paid, collected];
  }
}
