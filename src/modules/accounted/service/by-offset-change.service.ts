import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
          amount: byOffsetCreateRequest.amount,
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
    });
  }

  async updateOffset(
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
    byOffsetUpdateRequest: ByOffsetUpdateRequestDto,
  ): Promise<void> {
    const check = await this.prisma.accounted.findFirst({
      where: {
        id: accountedId,
        accountedType,
        companyId,
        isDeleted: false,
      },
    });
    if (!check)
      throw new NotFoundException(`존재하지 않는 수금/지급 정보 입니다.`);
    if (check.accountedMethod !== 'OFFSET')
      throw new ConflictException(`수금/지급 수단 에러`);

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
              amount: byOffsetUpdateRequest.amount,
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
              amount: byOffsetUpdateRequest.amount,
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
  }
}
