import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class TaxInvoiceRetriveService {
  constructor(private prismaService: PrismaService) {}

  async getTaxInvoiceList(params: {
    companyId: number;
    skip: number;
    take: number;
  }) {
    const data = await this.prismaService.taxInvoice.findMany({
      where: { companyId: params.companyId },
      skip: params.skip,
      take: params.take,
      select: {
        id: true,
        companyRegistrationNumber: true,
        invoicerMgtKey: true,
        writeDate: true,
      },
    });

    return data;
  }

  async getTaxInvoiceCount(params: { companyId: number }) {
    const data = await this.prismaService.taxInvoice.count({
      where: { companyId: params.companyId },
    });

    return data;
  }

  async getTaxInvoiceItem(params: { id: number }) {
    const data = await this.prismaService.taxInvoice.findUnique({
      where: { id: params.id },
    });

    return data;
  }
}
