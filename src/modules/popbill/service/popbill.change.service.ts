import { Get, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class PopbillChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async issueTaxInvoice(companyId: number, taxInvoiceId: number) {}
}
