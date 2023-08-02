import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class AccountRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: number): Promise<Model.User> {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        company: true,
        username: true,
        name: true,
        email: true,
        phoneNo: true,
        birthDate: true,
        isActivated: true,
        isAdmin: true,
      },
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException(`존재하지 않는 유저입니다.`);

    return Util.serialize(user);
  }
}
