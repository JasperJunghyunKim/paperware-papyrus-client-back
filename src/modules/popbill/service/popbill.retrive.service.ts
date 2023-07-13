import { Get, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { getCertUrl } from './popbill.service';

@Injectable()
export class PopbillRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getCertUrl(CorpNum: string, UserID: string): Promise<string> {
    return await getCertUrl(CorpNum, UserID);
  }
}
