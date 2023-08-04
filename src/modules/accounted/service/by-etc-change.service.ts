import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import {
  ByEtcCreateRequestDto,
  ByEtcUpdateRequestDto,
} from '../api/dto/etc.request';

@Injectable()
export class ByEtcChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createEtc(
    companyId: number,
    accountedType: AccountedType,
    byEtcCreateRequest: ByEtcCreateRequestDto,
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
              byEtcCreateRequest.companyRegistrationNumber,
            accountedType,
            accountedSubject: byEtcCreateRequest.accountedSubject,
            accountedMethod: 'ETC',
            accountedDate: byEtcCreateRequest.accountedDate,
            memo: byEtcCreateRequest.memo || '',
            byEtc: {
              create: {
                etcAmount: byEtcCreateRequest.amount,
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

  async updateEtc(
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
    byEtcUpdateRequest: ByEtcUpdateRequestDto,
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
    if (check.accountedMethod !== 'ETC')
      throw new ConflictException(`수금/지급 수단 에러`);

    await this.prisma.accounted.update({
      data: {
        accountedType,
        accountedSubject: byEtcUpdateRequest.accountedSubject,
        accountedDate: byEtcUpdateRequest.accountedDate,
        memo: byEtcUpdateRequest.memo ?? '',
        byEtc: {
          update: {
            etcAmount: byEtcUpdateRequest.amount,
          },
        },
      },
      select: {
        id: true,
      },
      where: {
        id: accountedId,
      },
    });
  }

  async deleteEtc(
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byEtc: true,
      },
      where: {
        id: accountedId,
        accountedType,
      },
    });

    await lastValueFrom(
      from(
        this.prisma.byEtc.update({
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
          where: { id: result.byEtc.id },
        }),
      ),
    );
  }
}
