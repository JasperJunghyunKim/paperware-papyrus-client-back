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

    const shippings = await this.prisma.$transaction(async (tx) => {
      await tx.invoice.updateMany({
        where: {
          id: {
            in: invoiceIds,
          },
        },
        data: {
          shippingId: shippingId,
          invoiceStatus: 'WAIT_SHIPPING',
        },
      });

      return await tx.shipping.update({
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
    });

    return shippings;
  }

  async forward(params: { shippingId: number }) {
    const { shippingId } = params;

    const shipping = await this.prisma.shipping.findUnique({
      where: {
        id: shippingId,
      },
      select: {
        status: true,
      },
    });

    await this.prisma.shipping.update({
      where: {
        id: shippingId,
      },
      data: {
        status: shipping.status == 'PREPARING' ? 'PROGRESSING' : 'DONE',
      },
    });

    return shipping;
  }

  async backward(params: { shippingId: number }) {
    const { shippingId } = params;

    const shipping = await this.prisma.shipping.findUnique({
      where: {
        id: shippingId,
      },
      select: {
        status: true,
      },
    });

    await this.prisma.shipping.update({
      where: {
        id: shippingId,
      },
      data: {
        status: shipping.status == 'DONE' ? 'PROGRESSING' : 'PREPARING',
      },
    });

    return shipping;
  }
}
