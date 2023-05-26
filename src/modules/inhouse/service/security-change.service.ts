import { Injectable } from '@nestjs/common';
import { DrawedStatus, SecurityStatus } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { SecurityCreateRequestDto, SecurityUpdateRequestDto, SecurityUpdateStatusRequestDto } from '../api/dto/security.request';
import { SecurityError } from '../infrastructure/constants/security-error.enum';
import { SecurityPaidException } from '../infrastructure/exception/security-paid.exception';

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
        securitySerial: true,
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
      throw new SecurityPaidException(SecurityError.SECURITY_001, result.securitySerial)
    }

    if (result.securityStatus === SecurityStatus.ENDORSED) {
      throw new SecurityPaidException(SecurityError.SECURITY_002, result.securitySerial)
    }

    if (result.securityStatus !== SecurityStatus.NONE) {
      throw new SecurityPaidException(SecurityError.SECURITY_003, result.securitySerial)
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
        securitySerial: true,
        drawedStatus: true,
        securityStatus: true,
      },
      where: {
        id: securityId,
      }
    });

    if (result.securityStatus === SecurityStatus.ENDORSED) {
      throw new SecurityPaidException(SecurityError.SECURITY_002, result.securitySerial)
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
        securitySerial: true,
        drawedStatus: true,
        securityStatus: true,
      },
      where: {
        id: securityId,
      }
    });

    if (result.drawedStatus !== DrawedStatus.SELF) {
      throw new SecurityPaidException(SecurityError.SECURITY_001, result.securitySerial)
    }

    if (result.securityStatus === SecurityStatus.ENDORSED) {
      throw new SecurityPaidException(SecurityError.SECURITY_002, result.securitySerial)
    }

    if (result.securityStatus !== SecurityStatus.NONE) {
      throw new SecurityPaidException(SecurityError.SECURITY_003, result.securitySerial)
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
