import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class TaxInvoiceChangeService {
  constructor(private priamsService: PrismaService) {}

  async createTaxInvoice(params: {
    companyId: number;
    companyRegistrationNumber: string;
    writeDate: string;
  }) {
    const data = await this.priamsService.taxInvoice.create({
      data: {
        companyId: params.companyId,
        companyRegistrationNumber: params.companyRegistrationNumber,
        writeDate: params.writeDate,
        invoicerMgtKey: ulid().substring(0, 24),
      },
      select: { id: true },
    });

    return data.id;
  }

  async updateTaxInvoice(params: { id: number }) {
    const data = await this.priamsService.taxInvoice.update({
      where: { id: params.id },
      data: {},
      select: { id: true },
    });

    return data.id;
  }

  async deleteTaxInvoice(params: { id: number }) {
    const data = await this.priamsService.taxInvoice.delete({
      where: { id: params.id },
      select: { id: true },
    });

    return data.id;
  }
}
