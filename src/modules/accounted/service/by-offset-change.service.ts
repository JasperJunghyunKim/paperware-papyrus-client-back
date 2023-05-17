import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { ByOffsetCreateRequestDto, ByOffsetUpdateRequestDto } from '../api/dto/offset.request';

@Injectable()
export class ByOffsetChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createOffset(accountedType: AccountedType, byOffsetCreateRequest: ByOffsetCreateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            partner: {
              connect: {
                id: byOffsetCreateRequest.partnerId,
              },
            },
            accountedType,
            accountedSubject: byOffsetCreateRequest.accountedSubject,
            accountedMethod: byOffsetCreateRequest.accountedMethod,
            accountedDate: byOffsetCreateRequest.accountedDate,
            memo: byOffsetCreateRequest.memo ?? '',
            byOffset: {
              create: {
                offsetAmount: byOffsetCreateRequest.amount,
              }
            }
          },
        })
      )
    );
  }

  async updateOffset(accountedType: AccountedType, accountedId: number, byOffsetUpdateRequest: ByOffsetUpdateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            accountedType,
            accountedSubject: byOffsetUpdateRequest.accountedSubject,
            accountedMethod: byOffsetUpdateRequest.accountedMethod,
            accountedDate: byOffsetUpdateRequest.accountedDate,
            memo: byOffsetUpdateRequest.memo ?? '',
            byOffset: {
              update: {
                offsetAmount: byOffsetUpdateRequest.amount,
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

  async deleteOffset(accountedType: AccountedType, accountedId: number): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byOffset: true,
      },
      where: {
        id: accountedId,
        accountedType,
      }
    });

    await lastValueFrom(
      from(
        this.prisma.byOffset.update({
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
          where: {
            id: result.byOffset.id,
          }
        })
      )
    );
  }
}
