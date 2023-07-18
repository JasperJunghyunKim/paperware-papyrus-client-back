import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { PopbillRetriveService } from './popbill.retrive.service';
import {
  PopbillResponse,
  cancelIssue,
  deleteTaxInvoice,
  registIssue,
  sendToNTS,
} from './popbill.service';
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
  ): Promise<PopbillResponse> {
    return await registIssue(companyRegistrationNumber, taxInvoice);
  }

  async sendTaxInvoice(
    companyRegistrationNumber: string,
    mgtKey: string,
  ): Promise<PopbillResponse> {
    return await sendToNTS(companyRegistrationNumber, mgtKey);
  }

  async cancelIssue(
    companyRegistrationNumber: string,
    mgtKey: string,
  ): Promise<PopbillResponse> {
    return await cancelIssue(companyRegistrationNumber, mgtKey);
  }

  async deleteTaxInvoice(companyRegistrationNumber: string, mgtKey: string) {
    return await deleteTaxInvoice(companyRegistrationNumber, mgtKey);
  }
}
