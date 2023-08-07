import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { from, lastValueFrom, map } from 'rxjs';
import {
  SecurityItemResponseDto,
  SecurityListResponseDto,
} from '../api/dto/security.response';
import { Model } from 'src/@shared';
import { Util } from 'src/common';

@Injectable()
export class SecurityRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getSecurityList(
    companyId: number,
    skip: number,
    take: number,
  ): Promise<{
    items: Model.Security[];
    total: number;
  }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.security.findMany({
        select: {
          id: true,
          securityType: true,
          securitySerial: true,
          securityAmount: true,
          securityStatus: true,
          drawedStatus: true,
          drawedDate: true,
          drawedBank: true,
          drawedBankBranch: true,
          drawedRegion: true,
          drawer: true,
          maturedDate: true,
          payingBank: true,
          payingBankBranch: true,
          payer: true,
          memo: true,
        },
        where: {
          companyId,
          isDeleted: false,
        },
        skip,
        take,
        orderBy: {
          id: 'desc',
        },
      }),
      this.prisma.security.count({
        where: {
          companyId,
          isDeleted: false,
        },
      }),
    ]);

    return {
      items: items.map((item) => Util.serialize(item)),
      total,
    };
  }

  async getSecurityItem(
    companyId: number,
    cardId: number,
  ): Promise<Model.Security> {
    const item = await this.prisma.security.findFirst({
      select: {
        id: true,
        securityType: true,
        securitySerial: true,
        securityAmount: true,
        securityStatus: true,
        drawedStatus: true,
        drawedDate: true,
        drawedBank: true,
        drawedBankBranch: true,
        drawedRegion: true,
        drawer: true,
        maturedDate: true,
        payingBank: true,
        payingBankBranch: true,
        payer: true,
        memo: true,
      },
      where: {
        id: cardId,
        companyId,
        isDeleted: false,
      },
    });
    if (!item)
      throw new NotFoundException(`존재하지 않는 유가증권 정보입니다.`);

    return Util.serialize(item);
  }
}
