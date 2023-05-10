import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class InvoiceChangeService {
  constructor(private prisma: PrismaService) {}

  async disconnectShipping(params: { invoiceIds: number[] }) {
    const { invoiceIds } = params;

    const invoices = await this.prisma.invoice.updateMany({
      where: {
        id: {
          in: invoiceIds,
        },
      },
      data: {
        shippingId: null,
      },
    });

    return invoices;
  }
}
