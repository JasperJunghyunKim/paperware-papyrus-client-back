import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AuthenticationLogType } from '@prisma/client';
import * as dayjs from 'dayjs';
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

  async updatePhoneNo(userId: number, phoneNo: string, authKey: string) {
    await this.prisma.$transaction(async (tx) => {
      const auth = await tx.authentication.findUnique({
        where: {
          phoneNo,
        },
      });
      if (!auth || auth.authKey !== authKey)
        throw new ConflictException(
          `인증정보가 올바르지 않습니다. 다시 시도해주세요.`,
        );

      await this.authService.createSmsAuthenticationLogTx(tx, {
        type: AuthenticationLogType.AUTH_KEY,
        phoneNo: auth.phoneNo,
        authKey: auth.authKey,
        authNo: auth.authNo,
        inputAuthKey: authKey,
      });

      await tx.authentication.delete({
        where: {
          phoneNo,
        },
      });

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          phoneNo,
        },
      });
    });
  }
}
