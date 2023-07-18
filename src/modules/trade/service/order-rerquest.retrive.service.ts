import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class OrderRequestRetriveService {
  constructor(private readonly prisma: PrismaService) {}
}
