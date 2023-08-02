import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'secret',
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });
      if (!user || !user.isActivated) throw new UnauthorizedException();

      // TODO intercepter에서 사용자 정보에 대해 변경 및 추가적인 조건을 실행 하고 싶을 때 사용
      // 다만 컨트롤에서에서 유저에 대한 정보를 꺼내어서 변경하는 행위는 안됨(글로벌로 처리 여부 확인 필요) or 안사용하면 삭제...
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
