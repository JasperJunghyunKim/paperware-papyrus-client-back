import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class StockArrivalChangeService {
  constructor(private readonly prisma: PrismaService) {}
}
