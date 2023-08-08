import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { from, lastValueFrom, map } from 'rxjs';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';

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
        select: Selector.SECURITY,
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
      select: Selector.SECURITY,
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
