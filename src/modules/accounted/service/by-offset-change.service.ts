import { Injectable } from '@nestjs/common';
import { AccountedType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/core';
import { ByOffsetCreateRequestDto, ByOffsetUpdateRequestDto } from '../api/dto/offset.request';

@Injectable()
export class ByOffsetChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createOffset(accountedType: AccountedType, byOffsetCreateRequest: ByOffsetCreateRequestDto): Promise<void> {
    const param: Prisma.AccountedCreateInput = {
      partner: {
        connect: {
          id: byOffsetCreateRequest.partnerId,
        },
      },
      accountedType: 'PAID',
      accountedSubject: byOffsetCreateRequest.accountedSubject,
      accountedMethod: byOffsetCreateRequest.accountedMethod,
      accountedDate: byOffsetCreateRequest.accountedDate,
      memo: byOffsetCreateRequest.memo ?? '',
      byOffset: {
        create: {
          offsetAmount: byOffsetCreateRequest.amount,
        }
      }
    }

    await this.prisma.$transaction(async (prismaTa) => {
      const paid = await prismaTa.accounted.create({
        data: {
          ...param,
          accountedType: 'PAID',
        },
      })

      const collected = await prismaTa.accounted.create({
        data: {
          ...param,
          accountedType: 'COLLECTED',
        },
      })

      await prismaTa.byOffsetPair.create({
        data: {
          paidId: paid.id,
          collectedId: collected.id,
        },
      })
    })
  }

  async updateOffset(accountedType: AccountedType, accountedId: number, byOffsetUpdateRequest: ByOffsetUpdateRequestDto): Promise<void> {
    // await lastValueFrom(
    //   from(
    //     this.prisma.accounted.update({
    //       data: {
    //         accountedType,
    //         accountedSubject: byOffsetUpdateRequest.accountedSubject,
    //         accountedMethod: byOffsetUpdateRequest.accountedMethod,
    //         accountedDate: byOffsetUpdateRequest.accountedDate,
    //         memo: byOffsetUpdateRequest.memo ?? '',
    //         byOffset: {
    //           update: {
    //             offsetCollectedPair: {
    //               update: {
    //                 byOffsetPaid: {
    //                   update: {
    //                     offsetAmount: byOffsetUpdateRequest.amount,
    //                   }
    //                 }
    //               }
    //             },
    //             offsetPaidPair: {
    //               update: {
    //                 byOffsetCollected: {
    //                   update: {
    //                     offsetAmount: byOffsetUpdateRequest.amount,
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       },
    //       where: {
    //         id: accountedId
    //       }
    //     })
    //   )
    // );
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
    console.log(result)

    const x = await this.prisma.byOffsetPair.findMany({
      select: {
        byOffsetCollected: true,
        byOffsetPaid: true,
      },
      where: {
        OR: [
          {
            byOffsetPaid: {
              accountedId
            },
            byOffsetCollected: {
              accountedId
            }
          }
        ]
      }
    })

    console.log(x);

    // await lastValueFrom(
    //   from(
    //     this.prisma.byOffset.update({
    //       data: {
    //         isDeleted: true,
    //         accounted: {
    //           update: {
    //             isDeleted: true,
    //           }
    //         }
    //       },
    //       include: {
    //         accounted: true,
    //       },
    //       where: {
    //         id: result.byOffset.id,
    //       }
    //     })
    //   )
    // );
  }
}
