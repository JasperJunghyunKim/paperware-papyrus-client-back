import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class CartRetriveService {
  constructor(private readonly prisma: PrismaService) {}
}
