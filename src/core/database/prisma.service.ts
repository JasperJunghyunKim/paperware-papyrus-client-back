// @see https://github.com/prisma/prisma/issues/12339
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaLogger } from './prisma-logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly prismaLogger: PrismaLogger) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    this.$on(
      'query' as any,
      (event: Prisma.QueryEvent | Prisma.LogEvent | (() => Promise<void>)) => {
        this.prismaLogger.query(event as Prisma.QueryEvent & Prisma.LogEvent);
      },
    );
    this.$on(
      'info' as any,
      (event: Prisma.QueryEvent | Prisma.LogEvent | (() => Promise<void>)) => {
        this.prismaLogger.info(event as Prisma.QueryEvent & Prisma.LogEvent);
      },
    );
    this.$on(
      'warn' as any,
      (event: Prisma.QueryEvent | Prisma.LogEvent | (() => Promise<void>)) => {
        this.prismaLogger.warn(event as Prisma.QueryEvent & Prisma.LogEvent);
      },
    );
    this.$on(
      'error' as any,
      (event: Prisma.QueryEvent | Prisma.LogEvent | (() => Promise<void>)) => {
        this.prismaLogger.error(event as Prisma.QueryEvent & Prisma.LogEvent);
      },
    );
    await this.$connect();

    await this.$queryRaw`
      SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
    `
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
