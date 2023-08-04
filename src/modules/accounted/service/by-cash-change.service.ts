import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import {
  ByCashCreateRequestDto,
  ByCashUpdateRequestDto,
} from '../api/dto/cash.request';

@Injectable()
export class ByCashChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createCash(
    companyId: number,
    accountedType: AccountedType,
    byCashCreateRequest: ByCashCreateRequestDto,
  ): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            // TODO: company, partner 확인
            company: {
              connect: {
                id: companyId,
              },
            },
            partnerCompanyRegistrationNumber:
              byCashCreateRequest.companyRegistrationNumber,
            accountedType,
            accountedSubject: byCashCreateRequest.accountedSubject,
            accountedMethod: 'CASH',
            accountedDate: byCashCreateRequest.accountedDate,
            memo: byCashCreateRequest.memo || '',
            byCash: {
              create: {
                cashAmount: byCashCreateRequest.amount,
              },
            },
          },
          select: {
            id: true,
          },
        }),
      ),
    );
  }

  async updateCash(
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
    byCashUpdateRequestDto: ByCashUpdateRequestDto,
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
    if (check.accountedMethod !== 'CASH')
      throw new ConflictException(`수금/지급 수단 에러`);

    await this.prisma.accounted.update({
      data: {
        accountedType,
        accountedSubject: byCashUpdateRequestDto.accountedSubject,
        accountedDate: byCashUpdateRequestDto.accountedDate,
        memo: byCashUpdateRequestDto.memo || '',
        byCash: {
          update: {
            cashAmount: byCashUpdateRequestDto.amount,
          },
        },
      },
      where: {
        id: accountedId,
      },
    });
  }

  async deleteCash(
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byCash: true,
      },
      where: {
        id: accountedId,
        accountedType,
      },
    });

    await lastValueFrom(
      from(
        this.prisma.byCash.update({
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
            id: result.byCash.id,
          },
        }),
      ),
    );
  }
}
