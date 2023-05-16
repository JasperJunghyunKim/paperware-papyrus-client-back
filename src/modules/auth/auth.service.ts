import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }

  async signIn(params: {
    username: string;
    password: string;
  }): Promise<string | null | any> {
    const { username, password } = params;
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        company: true,
      },
    });

    // const payload = { username: user.username, sub: user.name };
    // return {
    //   access_token: this.jwtService.sign(payload),
    // };

    if (!user || user.password !== password) {
      throw new BadRequestException('Invalid username or password');
    }

    return await this.jwtService.signAsync({
      id: user.id,
      companyId: user.company.id,
    });
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        company: true,
      },
    });

    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
