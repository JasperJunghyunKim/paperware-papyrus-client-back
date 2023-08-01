import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AccountChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

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

  async updatePassowrd(userId: number, password: string) {
    const hashedPassword = await this.authService.hashPassword(password);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  }
}
