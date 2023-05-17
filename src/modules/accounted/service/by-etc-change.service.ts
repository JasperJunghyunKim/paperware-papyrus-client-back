import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { ByEtcCreateRequestDto, ByEtcUpdateRequestDto } from '../api/dto/etc.request';

@Injectable()
export class ByEtcChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createEtc(accountedType: AccountedType, byEtcCreateRequest: ByEtcCreateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            partner: {
              connect: {
                id: byEtcCreateRequest.partnerId,
              },
            },
            accountedType,
            accountedSubject: byEtcCreateRequest.accountedSubject,
            accountedMethod: byEtcCreateRequest.accountedMethod,
            accountedDate: byEtcCreateRequest.accountedDate,
            memo: byEtcCreateRequest.memo ?? '',
            byEtc: {
              create: {
                etcAmount: byEtcCreateRequest.amount,
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

  async updateEtc(accountedType: AccountedType, accountedId: number, byEtcUpdateRequest: ByEtcUpdateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            accountedType,
            accountedSubject: byEtcUpdateRequest.accountedSubject,
            accountedMethod: byEtcUpdateRequest.accountedMethod,
            accountedDate: byEtcUpdateRequest.accountedDate,
            memo: byEtcUpdateRequest.memo ?? '',
            byEtc: {
              update: {
                etcAmount: byEtcUpdateRequest.amount,
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

  async deleteEtc(accountedType: AccountedType, accountedId: number): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byEtc: true,
      },
      where: {
        id: accountedId,
        accountedType
      }
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
