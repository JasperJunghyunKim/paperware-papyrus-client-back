import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class SettingCompanyChangeService {
  constructor(private readonly prisma: PrismaService) {}
}
