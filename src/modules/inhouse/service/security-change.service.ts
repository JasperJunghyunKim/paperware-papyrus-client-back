import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bank, SecurityStatus, SecurityType } from '@prisma/client';
import { NotFoundError, from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core';
import { SecurityCreateRequestDto } from '../api/dto/security.request';
import { SecurityError } from '../infrastructure/constants/security-error.enum';
import { SecurityPaidException } from '../infrastructure/exception/security-paid.exception';
import { PrismaTransaction } from 'src/common/types';

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

  private async getSecurityForUpdateTx(
    tx: PrismaTransaction,
    securityId: number,
    companyId: number,
  ) {
    const [security]: {
      id: number;
      securityStatus: SecurityStatus;
      bySecurityCount: bigint;
    }[] = await tx.$queryRaw`
      SELECT *, IFNULL(bs.bsCount, 0) AS bySecurityCount
        FROM Security       AS s
   LEFT JOIN (
        SELECT COUNT(1) AS bsCount, securityId
          FROM BySecurity

         GROUP BY securityId
      ) AS bs     ON bs.securityId = s.id
       WHERE s.id = ${securityId}
         AND s.companyId = ${companyId}
         AND s.isDeleted = ${false}

         FOR UPDATE;
    `;

    return security || null;
  }

  async deleteSecurity(companyId: number, securityId: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const security = await this.getSecurityForUpdateTx(
        tx,
        securityId,
        companyId,
      );

      if (!security)
        throw new NotFoundException(`존재하지 않는 유가증권 정보입니다.`);

      if (security.securityStatus !== 'NONE')
        throw new ConflictException(`삭제할 수 없는 상태입니다.`);
      if (Number(security.bySecurityCount) > 0)
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

  async updateStatus(
    companyId: number,
    securityId: number,
    securityStatus: SecurityStatus,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const security = await this.getSecurityForUpdateTx(
        tx,
        securityId,
        companyId,
      );

      if (!security)
        throw new NotFoundException(`존재하지 않는 유가증권 정보입니다.`);
      if (
        (security.securityStatus !== 'NONE' &&
          securityStatus !== 'NONE' &&
          security.securityStatus !== securityStatus) ||
        Number(security.bySecurityCount) > 0
      )
        throw new ConflictException(`수정할 수 없는 상태입니다.`);

      await tx.security.update({
        where: {
          id: security.id,
        },
        data: {
          securityStatus,
        },
      });
    });
  }
}
