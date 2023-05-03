import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }

  async signIn(params: {
    username: string;
    password: string;
  }): Promise<string | null> {
    const { username, password } = params;
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        company: true,
      },
    });

    if (!user || user.password !== password) {
      throw new BadRequestException('Invalid username or password');
    }

    return await this.jwtService.signAsync({
      id: user.id,
      companyId: user.company.id,
    });
  }
}
