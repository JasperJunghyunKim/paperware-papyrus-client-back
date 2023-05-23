import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { BySecurityCreateRequestDto, BySecurityUpdateRequestDto } from '../api/dto/security.request';

@Injectable()
export class BySecurityChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createBySecurity(accountedType: AccountedType, bySecurityCreateRequest: BySecurityCreateRequestDto): Promise<void> {

    // 1. 수금일때...
    // 1.1 수금 생성과 동시에 유가증권을 생성한다.



    // 2. 지급일때...
    // 2.1 지급 생성과 동시에 유가증권에 기존 정보를 가져와 등록한다.

    await lastValueFrom(
      from(
        this.prisma.accounted.create({
          data: {
            partner: {
              connect: {
                companyId_companyRegistrationNumber: {
                  companyRegistrationNumber: bySecurityCreateRequest.companyRegistrationNumber,
                  companyId: bySecurityCreateRequest.companyId,
                }
              },
            },
            accountedType,
            accountedSubject: bySecurityCreateRequest.accountedSubject,
            accountedMethod: bySecurityCreateRequest.accountedMethod,
            accountedDate: bySecurityCreateRequest.accountedDate,
            memo: bySecurityCreateRequest.memo ?? '',
            bySecurity: {
              create: {
                cardAmount: bySecurityCreateRequest.amount,
                isCharge: bySecurityCreateRequest.isCharge,
                chargeAmount: bySecurityCreateRequest.chargeAmount ?? 0,
                totalAmount: bySecurityCreateRequest.totalAmount ?? 0,
                approvalNumber: bySecurityCreateRequest.approvalNumber ?? '',
                security: {
                  connect: {
                    id: bySecurityCreateRequest.cardId,
                  },
                },
              }
            },
          },
        })
      )
    );
  }

  async updateBySecurity(accountedType: AccountedType, accountedId: number, bySecurityUpdateRequest: BySecurityUpdateRequestDto): Promise<void> {


    // 1. 수금일때...
    // 1.1 수금으로 생성된 애들만 수정 할수 있다.
    // 1.2 유가증권의 상태가 기본일때만 수정한다. (거래처, 수금수단, 수금금액 제외)
    // 1.3 지급에 등록된 정보가 있는지 확인 (필요하면)



    // 2. 지급일때...
    // 2.1 지급 생성과 동시에 유가증권에 기존 정보를 가져와 등록한다.
    // 2.2 회계쪽에서는 기존과 동일하게 수정한다.
    // ????






    await lastValueFrom(
      from(
        this.prisma.accounted.update({
          data: {
            accountedType,
            accountedSubject: bySecurityUpdateRequest.accountedSubject,
            accountedMethod: bySecurityUpdateRequest.accountedMethod,
            accountedDate: bySecurityUpdateRequest.accountedDate,
            memo: bySecurityUpdateRequest.memo ?? '',
            byBySecurity: {
              update: {
                cardAmount: bySecurityUpdateRequest.amount,
                isCharge: bySecurityUpdateRequest.isCharge,
                chargeAmount: bySecurityUpdateRequest.chargeAmount,
                approvalNumber: bySecurityUpdateRequest.approvalNumber,
                card: {
                  connect: {
                    id: bySecurityUpdateRequest.cardId,
                  },
                },
              }
            },
          },
          where: {
            id: accountedId
          }
        })
      )
    );
  }

  async deleteBySecurity(accountedType: AccountedType, accountedId: number): Promise<void> {

    // 1. 수금일때...
    // 1.1 수금으로 생성된 애들만 삭제 할수 있다.
    // 1.2 유가증권의 상태가 기본일때만 삭제 한다.
    // 1.3 지급에 등록된 정보가 있는지 확인 (필요하면)
    // 1.4 유가증권 테이블에 삭제한다. isDeleted = true
    // 1.5 회계 테이블에 삭제한다. isDeleted = true 4번과 동일



    // 2. 지급일때...
    // 2.1 지급 생성과 동시에 유가증권에 기존 정보를 가져와 등록한다.
    // 2.2 회계쪽에서는 기존과 동일하게 삭제한다.
    // 2.3 유가증권에서는 삭제하지 않고, 유가증권 상태를 기본(NONE)으로 변경한다.



    const result = await this.prisma.accounted.findFirst({
      select: {
        byBySecurity: true,
      },
      where: {
        id: accountedId,
        accountedType,
      }
    });

    await lastValueFrom(
      from(
        this.prisma.bySecurity.update({
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
            id: result.bySecurity.id,
          }
        })
      )
    );
  }
}
