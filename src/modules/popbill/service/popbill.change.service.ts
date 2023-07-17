import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { PopbillRetriveService } from './popbill.retrive.service';
import { registIssue } from './popbill.service';
import { PopbillTaxInvoice } from './popbill.interface';

@Injectable()
export class PopbillChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly popbillRetriveService: PopbillRetriveService,
  ) {}

  async issueTaxInvoice(
    companyRegistrationNumber: string,
    taxInvoice: PopbillTaxInvoice,
  ) {
    return await registIssue(companyRegistrationNumber, taxInvoice);
  }
}
