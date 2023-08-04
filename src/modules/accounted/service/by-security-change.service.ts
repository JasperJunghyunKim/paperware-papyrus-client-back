import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountedType,
  DrawedStatus,
  Prisma,
  SecurityStatus,
} from '@prisma/client';
import { isNil } from 'lodash';
import { PrismaService } from 'src/core';
import {
  BySecurityCreateRequestDto,
  BySecurityUpdateRequestDto,
} from '../api/dto/security.request';
import { BySecurityError } from '../infrastructure/constants/by-security-error.enum';
import { BySecurityException } from '../infrastructure/exception/by-security-status.exception';

@Injectable()
export class BySecurityChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createBySecurity(
    companyId: number,
    accountedType: AccountedType,
    bySecurityCreateRequest: BySecurityCreateRequestDto,
  ): Promise<void> {
    if (accountedType === AccountedType.PAID) {
      await this.prisma.$transaction(async (tx) => {
        const [security]: {
          id: number;
          securityStatus: SecurityStatus;
        }[] = await tx.$queryRaw`
          SELECT *
            FROM Security 
           WHERE id = ${bySecurityCreateRequest.securityId}
             AND companyId = ${companyId}
             AND isDeleted = ${false}

           FOR UPDATE;
        `;
        if (!security)
          throw new BadRequestException(`존재하지 않는 유가증권 입니다.`);
        if (security.securityStatus !== 'NONE')
          throw new ConflictException(`사용할 수 없는 유가증권 입니다.`);

        // 지급일때...
        await tx.accounted.create({
          data: {
            // TODO: company, partner 확인
            company: {
              connect: {
                id: companyId,
              },
            },
            partnerCompanyRegistrationNumber:
              bySecurityCreateRequest.companyRegistrationNumber,
            accountedType,
            accountedSubject: bySecurityCreateRequest.accountedSubject,
            accountedMethod: 'PROMISSORY_NOTE',
            accountedDate: bySecurityCreateRequest.accountedDate,
            memo: bySecurityCreateRequest.memo || '',
            bySecurity: {
              create: {
                securityId: bySecurityCreateRequest.securityId,
              },
            },
          },
        });

        await tx.security.update({
          data: {
            securityStatus: SecurityStatus.ENDORSED,
          },
          where: {
            id: bySecurityCreateRequest.securityId,
          },
        });
      });
    } else {
      // 수금일때...
      // 수금 생성과 동시에 유가증권을 생성한다.
      await this.prisma.accounted.create({
        data: {
          // TODO: company, partner 확인
          company: {
            connect: {
              id: companyId,
            },
          },
          partnerCompanyRegistrationNumber:
            bySecurityCreateRequest.companyRegistrationNumber,
          accountedType,
          accountedSubject: bySecurityCreateRequest.accountedSubject,
          accountedMethod: 'PROMISSORY_NOTE',
          accountedDate: bySecurityCreateRequest.accountedDate,
          memo: bySecurityCreateRequest.memo || '',
          bySecurity: {
            create: {
              endorsement: bySecurityCreateRequest.endorsement || '',
              endorsementType: bySecurityCreateRequest.endorsementType,
              security: {
                create: {
                  securityType: bySecurityCreateRequest.security.securityType,
                  securitySerial:
                    bySecurityCreateRequest.security.securitySerial,
                  securityAmount:
                    bySecurityCreateRequest.security.securityAmount,
                  securityStatus: 'NONE',
                  drawedStatus: DrawedStatus.ACCOUNTED,
                  drawedDate: bySecurityCreateRequest.security.drawedDate,
                  drawedBank: bySecurityCreateRequest.security.drawedBank,
                  drawedBankBranch:
                    bySecurityCreateRequest.security.drawedBankBranch || '',
                  drawedRegion:
                    bySecurityCreateRequest.security.drawedRegion || '',
                  drawer: bySecurityCreateRequest.security.drawer || '',
                  maturedDate: bySecurityCreateRequest.security.maturedDate,
                  payingBank: bySecurityCreateRequest.security.payingBank,
                  payingBankBranch:
                    bySecurityCreateRequest.security.payingBankBranch || '',
                  payer: bySecurityCreateRequest.security.payer || '',
                  memo: bySecurityCreateRequest.memo || '',
                  company: {
                    connect: {
                      id: companyId,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }
  }

  async updateBySecurity(
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
    bySecurityUpdateRequest: BySecurityUpdateRequestDto,
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
    if (check.accountedMethod !== 'PROMISSORY_NOTE')
      throw new ConflictException(`수금/지급 수단 에러`);

    if (accountedType === AccountedType.PAID) {
      // 1.  지급일때...
      await this.prisma.accounted.update({
        data: {
          accountedType,
          accountedSubject: bySecurityUpdateRequest.accountedSubject,
          accountedMethod: bySecurityUpdateRequest.accountedMethod,
          accountedDate: bySecurityUpdateRequest.accountedDate,
          memo: bySecurityUpdateRequest.memo,
        },
        where: {
          id: accountedId,
        },
      });
    } else {
      // 2.  수금일때...
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.accounted.update({
          data: {
            accountedType,
            accountedSubject: bySecurityUpdateRequest.accountedSubject,
            accountedMethod: bySecurityUpdateRequest.accountedMethod,
            accountedDate: bySecurityUpdateRequest.accountedDate,
            memo: bySecurityUpdateRequest.memo,
            bySecurity: {
              update: {
                endorsement: bySecurityUpdateRequest.endorsement,
                endorsementType: bySecurityUpdateRequest.endorsementType,
              },
            },
          },
          where: {
            id: accountedId,
          },
        });
      });
    }
  }

  async deleteBySecurity(
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<void> {
    if (accountedType === AccountedType.PAID) {
      // 1. 지급일때...
      // 1.1 지급 생성은 삭제 한다.
      // 1.2 유가증권에서는 삭제하지 않고, 유가증권 상태를 기본(NONE)으로 변경한다.
      this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const result = await tx.accounted.findFirst({
          select: {
            bySecurity: {
              select: {
                id: true,
                security: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
          where: {
            id: accountedId,
            accountedType,
          },
        });

        await tx.bySecurity.update({
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
            id: result.bySecurity.id,
          },
        });

        await tx.security.update({
          data: {
            securityStatus: SecurityStatus.NONE,
          },
          where: {
            id: result.bySecurity.security.id,
          },
        });
      });
    } else {
      // 2.  수금일때...
      // 2.1 유가증권의 상태가 기본일때만 삭제 한다.
      // 2.2 유가증권 테이블에 삭제한다. isDeleted = true
      // 2.3 회계 테이블에 삭제한다. isDeleted = true 4번과 동일
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const result = await tx.accounted.findFirst({
          select: {
            bySecurity: {
              select: {
                id: true,
                security: {
                  select: {
                    id: true,
                    securityStatus: true,
                  },
                },
              },
            },
          },
          where: {
            id: accountedId,
            accountedType,
          },
        });

        if (
          result?.bySecurity?.security?.securityStatus !== SecurityStatus.NONE
        ) {
          throw new BySecurityException(BySecurityError.BY_SECURITY_002, {
            bySecurityId: result.bySecurity.id,
          });
        }

        await tx.accounted.update({
          data: {
            isDeleted: true,
            bySecurity: {
              update: {
                isDeleted: true,
              },
            },
          },
          where: {
            id: accountedId,
          },
        });

        await tx.security.update({
          data: {
            isDeleted: true,
          },
          where: {
            id: result.bySecurity.security.id,
          },
        });
      });
    }
  }
}
