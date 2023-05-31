import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class StockArrivalRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getStockArrivalList(params: {
    skip?: number;
    take?: number;
    companyId: number;
  }): Promise<any> {
    const { skip, take, companyId } = params;

    return [];
  }

  async getStockArrivalCount(params: { companyId: number }) {
    return 0;
  }
}