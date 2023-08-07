import { Injectable } from '@nestjs/common';
import {
  Bank,
  DrawedStatus,
  SecurityStatus,
  SecurityType,
} from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import {
  SecurityCreateRequestDto,
  SecurityUpdateRequestDto,
  SecurityUpdateStatusRequestDto,
} from '../api/dto/security.request';
import { SecurityError } from '../infrastructure/constants/security-error.enum';
import { SecurityPaidException } from '../infrastructure/exception/security-paid.exception';

@Injectable()
export class SecurityChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createSecurity(params: {
    companyId: number;
    securityType: SecurityType;
    securitySerial: string;
    securityAmount: number;
    drawedDate: string | null;
    drawedBank: Bank | null;
    drawedBankBranch: string | null;
    drawedRegion: string | null;
    drawer: string | null;
    maturedDate: string | null;
    payingBank: Bank | null;
    payingBankBranch: string | null;
    payer: string | null;
    memo: string | null;
  }) {
    return await this.prisma.security.create({
      data: {
        securityType: params.securityType,
        securitySerial: params.securitySerial,
        securityAmount: params.securityAmount,
        drawedStatus: DrawedStatus.SELF,
        drawedDate: params.drawedDate,
        drawedBank: params.drawedBank,
        drawedBankBranch: params.drawedBankBranch,
        drawedRegion: params.drawedRegion,
        drawer: params.drawer,
        maturedDate: params.maturedDate,
        payingBank: params.payingBank,
        payingBankBranch: params.payingBankBranch,
        payer: params.payer,
        memo: params.memo || '',
        company: {
          connect: {
            id: params.companyId,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  async updateSecurity(
    securityId: number,
    securityUpdateRequest: SecurityUpdateRequestDto,
  ): Promise<void> {
    const result = await this.prisma.security.findUnique({
      select: {
        securitySerial: true,
        drawedStatus: true,
        securityStatus: true,
        bySecurityList: {
          select: {
            id: true,
            security: true,
          },
        },
      },
      where: {
        id: securityId,
      },
    });

    if (result.drawedStatus !== DrawedStatus.SELF) {
      throw new SecurityPaidException(
        SecurityError.SECURITY_001,
        result.securitySerial,
      );
    }

    if (result.securityStatus === SecurityStatus.ENDORSED) {
      throw new SecurityPaidException(
        SecurityError.SECURITY_002,
        result.securitySerial,
      );
    }

    if (result.securityStatus !== SecurityStatus.NONE) {
      throw new SecurityPaidException(
        SecurityError.SECURITY_003,
        result.securitySerial,
      );
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
          },
        }),
      ),
    );
  }

  async updateSecurityStatus(
    securityId: number,
    securityUpdateStatusRequest: SecurityUpdateStatusRequestDto,
  ): Promise<void> {
    const result = await this.prisma.security.findFirst({
      select: {
        securitySerial: true,
        drawedStatus: true,
        securityStatus: true,
      },
      where: {
        id: securityId,
      },
    });

    if (result.securityStatus === SecurityStatus.ENDORSED) {
      throw new SecurityPaidException(
        SecurityError.SECURITY_002,
        result.securitySerial,
      );
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
          },
        }),
      ),
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
      },
    });

    if (result.drawedStatus !== DrawedStatus.SELF) {
      throw new SecurityPaidException(
        SecurityError.SECURITY_001,
        result.securitySerial,
      );
    }

    if (result.securityStatus === SecurityStatus.ENDORSED) {
      throw new SecurityPaidException(
        SecurityError.SECURITY_002,
        result.securitySerial,
      );
    }

    if (result.securityStatus !== SecurityStatus.NONE) {
      throw new SecurityPaidException(
        SecurityError.SECURITY_003,
        result.securitySerial,
      );
    }

    await lastValueFrom(
      from(
        this.prisma.security.update({
          data: {
            isDeleted: true,
          },
          where: {
            id: securityId,
          },
        }),
      ),
    );
  }
}
