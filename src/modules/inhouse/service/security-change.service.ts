import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Bank,
  DrawedStatus,
  SecurityStatus,
  SecurityType,
} from '@prisma/client';
import { NotFoundError, from, lastValueFrom } from 'rxjs';
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

  async deleteSecurity(companyId: number, securityId: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const [security]: {
        id: number;
        securityStatus: SecurityStatus;
        drawedStatus: DrawedStatus;
      }[] = await tx.$queryRaw`
        SELECT *
          FROM Security
         WHERE id = ${securityId}
           AND companyId = ${companyId}
           AND isDeleted = ${false}

           FOR UPDATE;
      `;

      if (!security)
        throw new NotFoundException(`존재하지 않는 유가증권 정보입니다.`);

      if (security.securityStatus !== 'NONE')
        throw new ConflictException(`삭제할 수 없는 상태입니다.`);
      if (security.drawedStatus === 'ACCOUNTED')
        throw new ConflictException(
          `수금을 통해 생성된 유가증권 정보는 수금정보 삭제를 통해서만 삭제 가능합니다.`,
        );

      await tx.security.update({
        where: {
          id: security.id,
        },
        data: {
          isDeleted: true,
        },
      });
    });
  }
}
