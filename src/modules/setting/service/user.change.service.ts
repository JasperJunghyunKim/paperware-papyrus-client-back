import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async updateAdmin(companyId: number, userId: number) {
    await this.prisma.$transaction(async (tx) => {
      const [user]: {
        id: number;
        isActivated: boolean;
        isAdmin: boolean;
      }[] = await tx.$queryRaw`
        SELECT id, isActivated, isAdmin
          FROM User
         WHERE id = ${userId}
           AND companyId = ${companyId}
        
        FOR UPDATE;
      `;
      console.log(111, user);
      if (!user) throw new NotFoundException(`존재하지 않는 직원정보 입니다.`);
      if (!user.isActivated)
        throw new ConflictException(`비활성화 된 직원입니다.`);
      if (user.isAdmin)
        throw new ConflictException(`이미 관리자로 지정되어 있는 직원입니다.`);

      await tx.user.updateMany({
        where: {
          companyId,
        },
        data: {
          isAdmin: false,
        },
      });

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          isAdmin: true,
        },
      });
    });
  }
}
