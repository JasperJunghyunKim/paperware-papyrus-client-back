import { Injectable } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { from, lastValueFrom, map, throwIfEmpty } from 'rxjs';
import { PrismaService } from 'src/core';
import { AccountedError } from '../infrastructure/constants/accounted-error.enum';
import { AccountedNotFoundException } from '../infrastructure/exception/accounted-notfound.exception';
import { ByOffsetItemResponseDto } from '../api/dto/offset.response';

@Injectable()
export class ByOffsetRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getOffset(
    companyId: number,
    accountedType: AccountedType,
    accountedId: number,
  ): Promise<ByOffsetItemResponseDto> {
    const accounted = await this.prisma.accounted.findFirst({
      select: {
        id: true,
        companyId: true,
        partnerCompanyRegistrationNumber: true,
        accountedType: true,
        accountedDate: true,
        accountedSubject: true,
        accountedMethod: true,
        memo: true,
        byOffset: true,
      },
      where: {
        companyId,
        accountedType,
        id: accountedId,
        isDeleted: false,
      },
    });

    const partner = await this.prisma.partner.findUnique({
      where: {
        companyId_companyRegistrationNumber: {
          companyId: accounted.companyId,
          companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
        },
      },
    });

    return {
      companyId: accounted.companyId,
      companyRegistrationNumber: accounted.partnerCompanyRegistrationNumber,
      accountedId: accounted.id,
      accountedType: accounted.accountedType,
      accountedDate: accounted.accountedDate.toISOString(),
      accountedSubject: accounted.accountedSubject,
      accountedMethod: accounted.accountedMethod,
      amount: accounted.byOffset.amount,
      memo: accounted.memo,
      partnerNickName: partner.partnerNickName || '',
    };
  }
}
