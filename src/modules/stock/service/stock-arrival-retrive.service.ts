import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class StockArrivalRetriveService {
  constructor(private readonly prisma: PrismaService) {}
}
