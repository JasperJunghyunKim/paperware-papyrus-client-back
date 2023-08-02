import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Util } from 'src/common';
import { USER } from 'src/common/selector';
import { PrismaService } from 'src/core';

@Injectable()
export class SettingUserRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(
    companyId: number,
    skip: number,
    take: number,
  ): Promise<{
    items: Omit<Model.User, 'company'>[];
    total: number;
  }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          phoneNo: true,
          email: true,
          birthDate: true,
          isAdmin: true,
        },
        where: {
          companyId,
        },
        orderBy: {
          id: 'asc',
        },
        skip,
        take,
      }),
      this.prisma.user.count({
        where: {
          companyId,
        },
      }),
    ]);

    return {
      items: items.map((item) => Util.serialize(item)),
      total,
    };
  }
}
