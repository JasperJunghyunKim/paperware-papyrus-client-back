import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class AccountChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async updateAccount(params: {
    userId: number;
    name: string;
    birthDate: string;
    email: string;
  }) {
    await this.prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        name: params.name,
        birthDate: params.birthDate,
        email: params.email,
      },
    });
  }
}
