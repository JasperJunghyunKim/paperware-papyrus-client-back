import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class SettingUserChangeService {
  constructor(private readonly prisma: PrismaService) {}
}
