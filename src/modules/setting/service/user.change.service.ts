import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class SettingUserChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(params: {
    companyId: number;
    username: string;
    password: string;
    name: string;
    birthDate: string;
    email: string;
  }) {
    await this.prisma.$transaction(async (tx) => {
      const idCheck = await tx.user.findUnique({
        where: {
          username: params.username,
        },
      });
      if (idCheck) throw new ConflictException(`이미 존재하는 유저ID 입니다.`);

      const hashedPassword = await this.authService.hashPassword(
        params.password,
      );

      await tx.user.create({
        data: {
          company: {
            connect: {
              id: params.companyId,
            },
          },
          username: params.username,
          password: hashedPassword,
          name: params.name,
          birthDate: params.birthDate,
          email: params.email,
        },
      });
    });
  }
}
