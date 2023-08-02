import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { ulid } from 'ulid';
import { AuthenticationLogType, Prisma } from '@prisma/client';
import { PrismaTransaction } from 'src/common/types';
import { sendSMS } from '../popbill/service/popbill.service';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(params: { username: string; password: string }): Promise<{
    accessToken: string;
    isFirstLogin: boolean;
  }> {
    const { username, password } = params;
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
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

      if (!user || !(await this.comparePassword(password, user.password))) {
        throw new BadRequestException('Invalid username or password');
      }
      if (!user.isActivated) {
        throw new UnauthorizedException(`사용할 수 없는 계정입니다.`);
      }

      const accessToken = await this.jwtService.signAsync({
        id: user.id,
        companyId: user.company.id,
        companyRegistrationNumber: user.company.companyRegistrationNumber,
      });

      await tx.user.update({
        where: {
          username: user.username,
        },
        data: {
          lastLoginTime: new Date(),
        },
      });

      return {
        accessToken,
        isFirstLogin: user.lastLoginTime === null || !user.phoneNo,
      };
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

  private async createSalt(): Promise<string> {
    return await bcrypt.genSalt();
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await this.createSalt();
    return bcrypt.hash(password, salt);
  }

  public async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async createSmsAuthenticationLogTx(
    tx: PrismaTransaction,
    params: {
      type: AuthenticationLogType;
      phoneNo: string;
      authNo: string;
      authKey: string;
      inputAuthNo?: string | null;
      inputAuthKey?: string | null;
    },
  ) {
    await tx.authenticationLog.create({
      data: {
        type: params.type,
        phoneNo: params.phoneNo,
        authKey: params.authKey,
        authNo: params.authNo,
        inputAuthKey: params.inputAuthKey ? params.inputAuthKey : null,
        inputAuthNo: params.inputAuthNo ? params.inputAuthNo : null,
      },
    });
  }

  async sendSmsAuthentication(phoneNo: string) {
    const authNo = Math.random().toString().substring(2, 8);
    const authKey = ulid();

    await this.prisma.$transaction(async (tx) => {
      const [auth]: {
        phoneNo: string;
        authNo: string;
        authKey: string;
        count: number;
        isCreatedToday: bigint;
      }[] = await tx.$queryRaw`
        SELECT *, DATE(CONVERT_TZ(createdAt, '+00:00', '+09:00')) = DATE(CONVERT_TZ(NOW(),  '+00:00', '+09:00')) AS isCreatedToday
          FROM Authentication
         WHERE phoneNo = ${phoneNo}

         FOR UPDATE;
      `;

      if (auth) {
        if (auth.count >= 5 && Number(auth.isCreatedToday) === 1) {
          throw new BadRequestException(`문자 전송은 1일 5회까지 가능합니다.`);
        }
        await tx.authentication.update({
          data: {
            phoneNo,
            authNo,
            authKey,
            count: auth.isCreatedToday ? auth.count + 1 : 1,
            createdAt: new Date(),
          },
          where: {
            phoneNo,
          },
        });
      } else {
        await tx.authentication.create({
          data: {
            phoneNo,
            authNo,
            authKey,
          },
        });
      }

      await tx.authentication.upsert({
        create: {
          phoneNo,
          authNo,
          authKey,
        },
        update: {
          phoneNo,
          authNo,
          authKey,
          createdAt: new Date(),
        },
        where: {
          phoneNo,
        },
      });

      await this.createSmsAuthenticationLogTx(tx, {
        type: AuthenticationLogType.CREATE,
        phoneNo,
        authNo,
        authKey,
      });

      const contents = `
[PAPERWARE]
인증번호는 ${authNo} 입니다.`;

      const result = await sendSMS(phoneNo, contents);
      if (result instanceof Error) {
        throw new InternalServerErrorException('메세지 전송에 실패했습니다.');
      }
    });
  }

  async checkAuthNo(phoneNo: string, authNo: string) {
    return await this.prisma.$transaction(async (tx) => {
      const check = await tx.authentication.findFirst({
        where: {
          phoneNo,
          authNo,
        },
      });
      if (!check)
        throw new ConflictException(
          `인증정보가 올바르지 않습니다. 다시 시도해주세요.`,
        );

      await this.createSmsAuthenticationLogTx(tx, {
        type: AuthenticationLogType.AUTH_NO,
        phoneNo,
        authNo: check.authNo,
        authKey: check.authKey,
        inputAuthNo: authNo,
      });

      if (check.authNo !== authNo) {
        throw new ConflictException(
          `인증번호가 올바르지 않습니다. 다시 시도해주세요.`,
        );
      }

      if (dayjs(new Date()).diff(check.createdAt, 'second') > 3 * 60) {
        throw new ConflictException(
          `인증시간이 초과하였습니다. 인증번호를 다시 발급받아주세요.`,
        );
      }

      return {
        authKey: check.authKey,
      };
    });
  }

  async findId(params: {
    name: string;
    birthDate: string;
    phoneNo: string;
    authKey: string;
  }): Promise<{
    items: {
      companyName: string;
      username: string;
      createdAt: string;
    }[];
  }> {
    return await this.prisma.$transaction(async (tx) => {
      const [auth]: {
        phoneNo: string;
        authNo: string;
        authKey: string;
      }[] = await tx.$queryRaw`
        SELECT *
          FROM Authentication
         WHERE phoneNo = ${params.phoneNo}

         FOR UPDATE;
      `;

      if (!auth)
        throw new ConflictException(`인증에러입니다. 다시 시도해주세요.`);

      await this.createSmsAuthenticationLogTx(tx, {
        type: AuthenticationLogType.AUTH_KEY,
        phoneNo: auth.phoneNo,
        authNo: auth.authNo,
        authKey: auth.authKey,
        inputAuthKey: params.authKey,
      });

      if (auth.authKey !== params.authKey)
        throw new ConflictException(`인증에러입니다. 다시 시도해주세요.`);

      await tx.authentication.delete({
        where: {
          phoneNo: params.phoneNo,
        },
      });

      const users: {
        userId: number;
        username: string;
        phoneNo: string;
        name: string;
        birthDate: string;
        createdAt: string;
        companyName: string;
      }[] = await tx.$queryRaw`
        SELECT u.id AS userId
              , u.username AS username
              , u.phoneNo AS phoneNo
              , u.name AS name
              , u.birthDate AS birthDate
              , u.createdAt AS createdAt
              , c.businessName AS companyName
          FROM User       AS u
          JOIN Company    AS c        ON c.id = u.companyId
         WHERE u.phoneNo = ${params.phoneNo}
           AND u.name = ${params.name}
           AND DATE(CONVERT_TZ(u.birthDate, '+00:00', '+09:00')) = DATE(CONVERT_TZ(${params.birthDate}, '+00:00', '+09:00'))
      `;

      if (users.length === 0)
        throw new NotFoundException(`일치하는 회원정보가 없습니다.`);

      return {
        items: users.map((user) => ({
          companyName: user.companyName,
          username: user.username,
          createdAt: user.createdAt,
        })),
      };
    });
  }
}
