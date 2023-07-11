import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class PartnerChangeSerivce {
  constructor(private readonly prisma: PrismaService) {}
}
