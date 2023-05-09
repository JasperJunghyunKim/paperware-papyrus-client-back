import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class OrderRetriveService {
  constructor(private readonly prisma: PrismaService) {}
}
