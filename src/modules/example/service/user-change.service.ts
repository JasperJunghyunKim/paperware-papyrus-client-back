import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class UserChangeService {
  constructor(private prismaService: PrismaService) { }

  async save(userCreateInput: Prisma.UserCreateInput): Promise<any> {
    await lastValueFrom(from(this.prismaService.user.create({ data: userCreateInput })));
  }

  async modify(userId: number, userUpdateInput: Prisma.UserUpdateInput): Promise<any> {
    await lastValueFrom(from(
      this.prismaService.user.update({
        data: userUpdateInput,
        where: {
          id: userId,
        },
      }),
    ));
  }

  async delete(userId: number): Promise<any> {
    await lastValueFrom(from(
      this.prismaService.user.delete({
        where: {
          id: userId,
        },
      }),
    ));
  }
}
