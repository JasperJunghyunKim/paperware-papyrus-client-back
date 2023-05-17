import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { ByCashCreateRequestDto, ByCashUpdateRequestDto } from '../api/dto/cash.request';

@Injectable()
export class ByCashChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createCash(accountedType: AccountedType, byCashCreateRequestDto: ByCashCreateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            partner: {
              connect: {
                id: byCashCreateRequestDto.partnerId,
              },
            },
            accountedType,
            accountedSubject: byCashCreateRequestDto.accountedSubject,
            accountedMethod: byCashCreateRequestDto.accountedMethod,
            accountedDate: byCashCreateRequestDto.accountedDate,
            memo: byCashCreateRequestDto.memo ?? '',
            byCash: {
              create: {
                cashAmount: byCashCreateRequestDto.amount,
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

  async updateCash(accountedType: AccountedType, accountedId: number, byCashUpdateRequestDto: ByCashUpdateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            accountedType,
            accountedSubject: byCashUpdateRequestDto.accountedSubject,
            accountedMethod: byCashUpdateRequestDto.accountedMethod,
            accountedDate: byCashUpdateRequestDto.accountedDate,
            memo: byCashUpdateRequestDto.memo ?? '',
            byCash: {
              update: {
                cashAmount: byCashUpdateRequestDto.amount,
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

  async deleteCash(accountedType: AccountedType, accountedId: number): Promise<void> {
    const result = await this.prisma.accounted.findFirst({
      select: {
        byCash: true,
      },
      where: {
        id: accountedId,
        accountedType,
      }
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
          where: {
            id: result.byCash.id,
          }
        })
      )
    );
  }
}
