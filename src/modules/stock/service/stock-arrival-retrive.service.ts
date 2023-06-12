import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class StockArrivalRetriveService {
    constructor(private readonly prisma: PrismaService) { }

}
