import { HttpException, Injectable } from '@nestjs/common';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { SecurityCreateRequestDto, SecurityUpdateRequestDto, SecurityUpdateStatusRequestDto } from '../api/dto/security.request';
import { DrawedStatus, SecurityStatus } from '@prisma/client';

@Injectable()
export class SecurityChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async createSecurity(companyId: number, securityCreateRequest: SecurityCreateRequestDto): Promise<void> {
    await lastValueFrom(
      from(
        this.prisma.security.create({
          data: {
            securityType: securityCreateRequest.securityType,
            securitySerial: securityCreateRequest.securitySerial,
            securityAmount: securityCreateRequest.securityAmount,
            securityStatus: SecurityStatus.NONE,
            drawedStatus: DrawedStatus.SELF,
            drawedDate: securityCreateRequest.drawedDate,
            drawedBank: securityCreateRequest.drawedBank,
            drawedBankBranch: securityCreateRequest.drawedBankBranch,
            drawedRegion: securityCreateRequest.drawedRegion,
            drawer: securityCreateRequest.drawer,
            maturedDate: securityCreateRequest.maturedDate,
            payingBank: securityCreateRequest.payingBank,
            payingBankBranch: securityCreateRequest.payingBankBranch,
            payer: securityCreateRequest.payer,
            memo: securityCreateRequest.memo,
            company: {
              connect: {
                id: companyId,
              }
            }
          },
        })
      )
    );
  }

  async updateSecurity(securityId: number, securityUpdateRequest: SecurityUpdateRequestDto): Promise<void> {
    const result = await this.prisma.security.findUnique({
      select: {
        drawedStatus: true,
        securityStatus: true,
        bySecurityList: {
          select: {
            id: true,
            security: true,
          }
        }
      },
      where: {
        id: securityId
      }
    });

    if (result.drawedStatus !== DrawedStatus.SELF) {
      throw new HttpException('자사 발행이 아닌 경우 수정할 수 없습니다. 수금내역조회에서 수정하세요.', 400);
    }

    if (result.securityStatus === SecurityStatus.ENDORSED) {
      throw new HttpException('해당 유가증권은 사용되었습니다. 지급에서 사용을 삭제한 후 변경하여 다시 시도해주세요.', 400);
    }

    if (result.securityStatus !== SecurityStatus.NONE) {
      throw new HttpException('유가증권은 사용되었습니다. 상태를 변경하고 다시 시도해주세요.', 400);
    }

    await lastValueFrom(
      from(
        this.prisma.security.update({
          data: {
            securityType: securityUpdateRequest.securityType,
            securitySerial: securityUpdateRequest.securitySerial,
            securityAmount: securityUpdateRequest.securityAmount,
            drawedDate: securityUpdateRequest.drawedDate,
            drawedBank: securityUpdateRequest.drawedBank,
            drawedBankBranch: securityUpdateRequest.drawedBankBranch,
            drawedRegion: securityUpdateRequest.drawedRegion,
            drawer: securityUpdateRequest.drawer,
            maturedDate: securityUpdateRequest.maturedDate,
            payingBank: securityUpdateRequest.payingBank,
            payingBankBranch: securityUpdateRequest.payingBankBranch,
            payer: securityUpdateRequest.payer,
            memo: securityUpdateRequest.memo,
          },
          select: {
            id: true,
          },
          where: {
            id: securityId,
          }
        })
      )
    );
  }

  async updateSecurityStatus(securityId: number, securityUpdateStatusRequest: SecurityUpdateStatusRequestDto): Promise<void> {
    const result = await this.prisma.security.findFirst({
      select: {
        drawedStatus: true,
        securityStatus: true,
      },
      where: {
        id: securityId,
      }
    });

    if (result.securityStatus === SecurityStatus.ENDORSED) {
      throw new HttpException('해당 유가증권은 사용되었습니다. 지급에서 사용을 삭제한 후 변경하여 다시 시도해주세요.', 400);
    }

    await lastValueFrom(
      from(
        this.prisma.security.update({
          data: {
            securityStatus: securityUpdateStatusRequest.securityStatus,
            memo: securityUpdateStatusRequest.memo,
          },
          select: {
            id: true,
          },
          where: {
            id: securityId,
          }
        })
      )
    );
  }

  async deleteSecurity(securityId: number): Promise<void> {
    const result = await this.prisma.security.findFirst({
      select: {
        drawedStatus: true,
        securityStatus: true,
      },
      where: {
        id: securityId,
      }
    });

    if (result.drawedStatus !== DrawedStatus.SELF) {
      throw new HttpException('자사 발행이 아닌 경우 삭제할 수 없습니다. 수금내역조회에서 삭제 하세요.', 400);
    }

    if (result.securityStatus === SecurityStatus.ENDORSED) {
      throw new HttpException('해당 유가증권은 사용되었습니다. 지급에서 사용을 삭제한 후 변경하여 다시 시도해주세요.', 400);
    }

    if (result.securityStatus !== SecurityStatus.NONE) {
      throw new HttpException('유가증권은 사용되었습니다. 상태를 변경하고 다시 시도해주세요.', 400);
    }

    await lastValueFrom(
      from(
        this.prisma.security.update({
          data: {
            isDeleted: true,
          },
          where: {
            id: securityId
          }
        })
      )
    );
  }
}
