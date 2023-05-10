import { Selector } from 'src/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class MeService {
  constructor(private prisma: PrismaService) {}

  async getMe(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      select: Selector.USER,
    });
  }
}
