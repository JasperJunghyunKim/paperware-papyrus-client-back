import { Injectable, NotFoundException } from '@nestjs/common';
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
          isActivated: true,
          isAdmin: true,
          menu: true,
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

  async get(
    companyId: number,
    id: number,
  ): Promise<Omit<Model.User, 'company'>> {
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
        username: true,
        name: true,
        phoneNo: true,
        email: true,
        birthDate: true,
        isActivated: true,
        isAdmin: true,
        menu: true,
      },
      where: {
        id,
        companyId,
      },
    });
    if (!user) throw new NotFoundException(`존재하지 않는 직원정보 입니다.`);
    return Util.serialize(user);
  }

  async chekcId(id: string): Promise<{ isExists: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: {
        username: id,
      },
    });

    return {
      isExists: !!user,
    };
  }
}
