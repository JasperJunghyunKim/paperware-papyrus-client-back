import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class ShippingChangeService {
  constructor(private prisma: PrismaService) {}

  async create(params: { companyId: number }) {
    const { companyId } = params;

    const shipping = await this.prisma.shipping.create({
      data: {
        shippingNo: ulid(),
        companyId: companyId,
      },
    });

    return shipping;
  }

  async connectInvoices(params: { shippingId: number; invoiceIds: number[] }) {
    const { shippingId, invoiceIds } = params;

    const shippings = await this.prisma.shipping.update({
      where: {
        id: shippingId,
      },
      data: {
        invoice: {
          connect: invoiceIds.map((invoiceId) => ({
            id: invoiceId,
          })),
        },
      },
    });

    return shippings;
  }
}
