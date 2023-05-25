import { HttpException, Injectable } from '@nestjs/common';
import { AccountedType, DrawedStatus, Prisma, SecurityStatus } from '@prisma/client';
import { PrismaService } from 'src/core';
import { BySecurityCreateRequestDto, BySecurityUpdateRequestDto } from '../api/dto/security.request';
import { isNil } from 'lodash';

@Injectable()
export class BySecurityChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createBySecurity(accountedType: AccountedType, bySecurityCreateRequest: BySecurityCreateRequestDto): Promise<void> {
    if (accountedType === AccountedType.PAID) {
      // 지급일때...
      await this.prisma.accounted.create({
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
          memo: bySecurityCreateRequest.memo,
          bySecurity: {
            create: {
              endorsement: bySecurityCreateRequest.endorsement,
              endorsementType: bySecurityCreateRequest.endorsementType,
              securityId: bySecurityCreateRequest.security.securityId,
            },
            connect: {
              id: bySecurityCreateRequest.security.securityId,
            }
          },
        },
      })
    } else {
      // 수금일때...
      // 수금 생성과 동시에 유가증권을 생성한다.
      await this.prisma.accounted.create({
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
              endorsement: bySecurityCreateRequest.endorsement,
              endorsementType: bySecurityCreateRequest.endorsementType,
              security: {
                create: {
                  securityType: bySecurityCreateRequest.security.securityType,
                  securitySerial: bySecurityCreateRequest.security.securitySerial,
                  securityAmount: bySecurityCreateRequest.security.securityAmount,
                  securityStatus: bySecurityCreateRequest.security.securityStatus,
                  drawedStatus: DrawedStatus.ACCOUNTED,
                  drawedDate: bySecurityCreateRequest.security.drawedDate,
                  drawedBank: bySecurityCreateRequest.security.drawedBank,
                  drawedBankBranch: bySecurityCreateRequest.security.drawedBankBranch,
                  drawedRegion: bySecurityCreateRequest.security.drawedRegion,
                  drawer: bySecurityCreateRequest.security.drawer,
                  maturedDate: bySecurityCreateRequest.security.maturedDate,
                  payingBank: bySecurityCreateRequest.security.payingBank,
                  payingBankBranch: bySecurityCreateRequest.security.payingBankBranch,
                  payer: bySecurityCreateRequest.security.payer,
                  memo: bySecurityCreateRequest.memo ?? '',
                  company: {
                    connect: {
                      id: bySecurityCreateRequest.companyId,
                    }
                  }
                }
              }
            }
          },
        },
      })
    }

  }

  async updateBySecurity(accountedType: AccountedType, accountedId: number, bySecurityUpdateRequest: BySecurityUpdateRequestDto): Promise<void> {

    if (accountedType === AccountedType.PAID) {
      // 유가증권 정보에 상태가 기본값인지 확인을 먼저한다. 그게 아닐경우 수정을 못하게 한다.
      const resultSecurity = await this.prisma.security.findFirst({
        select: {
          securityStatus: true,
        },
        where: {
          id: bySecurityUpdateRequest.security.securityId,
        }
      })

      // 1.  지급일때...
      // 1.1 유가증권의 상태가 배서지급일때만 수정한다. (거래처, 수금수단, 수금금액 제외)
      if (resultSecurity.securityStatus !== SecurityStatus.ENDORSED) {
        throw new HttpException('유가증권이 배서지급에 할당 되어 수정이 되지 않습니다.', 400);
      }

      await this.prisma.accounted.update({
        data: {
          accountedType,
          accountedSubject: bySecurityUpdateRequest.accountedSubject,
          accountedMethod: bySecurityUpdateRequest.accountedMethod,
          accountedDate: bySecurityUpdateRequest.accountedDate,
          memo: bySecurityUpdateRequest.memo ?? '',
          bySecurity: {
            update: {
              endorsement: bySecurityUpdateRequest.endorsement,
              endorsementType: bySecurityUpdateRequest.endorsementType,
              security: {
                update: {
                  id: bySecurityUpdateRequest.security.securityId,
                }
              }
            }
          },
        },
        where: {
          id: accountedId,
        }
      })
    } else {
      // 2.  수금일때...
      // 2.1 유가증권의 상태가 기본일때만 수정한다. (거래처, 수금수단, 수금금액 제외)
      // 2.2 지급에 등록된 정보가 있는지 확인
      const resultAccounted = await this.prisma.accounted.findFirst({
        select: {
          accountedType: true,
          accountedSubject: true,
          accountedMethod: true,
          bySecurity: {
            select: {
              security: {
                select: {
                  id: true,
                  securityStatus: true,
                }
              }
            }
          }
        },
        where: {
          id: accountedId,
          accountedType: AccountedType.PAID,
          bySecurity: {
            security: {
              id: bySecurityUpdateRequest.security.securityId,
            }
          }
        }
      });

      // 해당 row가 있으면 지급에 등록된 정보가 있다는 뜻이다.
      if (!isNil(resultAccounted)) {
        throw new HttpException('유가증권이 이미 사용 상태로 확인 됩니다. 유가증권 관리에 상태를 변경해서 사용하세요', 400);
      }

      this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.accounted.update({
          data: {
            accountedType,
            accountedSubject: bySecurityUpdateRequest.accountedSubject,
            accountedMethod: bySecurityUpdateRequest.accountedMethod,
            accountedDate: bySecurityUpdateRequest.accountedDate,
            memo: bySecurityUpdateRequest.memo ?? '',
            bySecurity: {
              update: {
                endorsement: bySecurityUpdateRequest.endorsement,
                endorsementType: bySecurityUpdateRequest.endorsementType,

              }
            },
          },
          where: {
            id: accountedId,
          }
        })

        await tx.security.updateMany({
          data: {
            id: bySecurityUpdateRequest.security.securityId,
            securityType: bySecurityUpdateRequest.security.securityType,
            securitySerial: bySecurityUpdateRequest.security.securitySerial,
            securityAmount: bySecurityUpdateRequest.security.securityAmount,
            securityStatus: bySecurityUpdateRequest.security.securityStatus,
            drawedStatus: DrawedStatus.ACCOUNTED,
            drawedDate: bySecurityUpdateRequest.security.drawedDate,
            drawedBank: bySecurityUpdateRequest.security.drawedBank,
            drawedBankBranch: bySecurityUpdateRequest.security.drawedBankBranch,
            drawedRegion: bySecurityUpdateRequest.security.drawedRegion,
            drawer: bySecurityUpdateRequest.security.drawer,
            maturedDate: bySecurityUpdateRequest.security.maturedDate,
            payingBank: bySecurityUpdateRequest.security.payingBank,
            payingBankBranch: bySecurityUpdateRequest.security.payingBankBranch,
            payer: bySecurityUpdateRequest.security.payer,
            memo: bySecurityUpdateRequest.memo ?? '',
          },
          where: {
            id: bySecurityUpdateRequest.security.securityId,
          }
        })
      })
    }

  }

  async deleteBySecurity(accountedType: AccountedType, accountedId: number): Promise<void> {
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
                  }
                }
              }
            },

          },
          where: {
            id: accountedId,
            accountedType,
          }
        });

        await tx.bySecurity.update({
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
          },
        })

        await tx.security.update({
          data: {
            securityStatus: SecurityStatus.NONE,
          },
          where: {
            id: result.bySecurity.security.id,
          }
        })
      })
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
                  }
                }
              }
            },
          },
          where: {
            id: accountedId,
            accountedType,
          }
        });

        if (result.bySecurity.security.securityStatus !== SecurityStatus.NONE) {
          throw new HttpException('유가증권이 이미 사용 상태로 확인 됩니다. 유가증권 관리에 상태를 변경해서 사용하세요', 400);
        }

        await tx.accounted.update({
          data: {
            isDeleted: true,
            bySecurity: {
              update: {
                isDeleted: true,
              }
            }
          },
          where: {
            id: accountedId,
          }
        })

        await tx.security.update({
          data: {
            isDeleted: true,
          },
          where: {
            id: result.bySecurity.security.id,
          }
        })

      })
    }
  }
}
