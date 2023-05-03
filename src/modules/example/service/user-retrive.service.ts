import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { from, lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class UserRetriveService {
  constructor(private prismaService: PrismaService) { }

  async findAll(): Promise<Array<User>> {
    return await lastValueFrom(from(this.prismaService.user.findMany()));
  }

  async find(userId: number): Promise<User> {
    return await lastValueFrom(from(
      this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      }),
    ));
  }
}
