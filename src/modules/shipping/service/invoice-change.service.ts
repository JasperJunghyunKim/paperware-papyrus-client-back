import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
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
        invoiceStatus: 'WAIT_LOADING',
      },
    });

    return invoices;
  }

  async forwardInvoiceStatus(companyId: number, invoiceIds: number[]) {
    await this.prisma.$transaction(async (tx) => {
      const invoices = await tx.invoice.findMany({
        where: {
          shipping: {
            companyId,
          },
          id: {
            in: invoiceIds,
          },
        },
      });
      if (invoiceIds.length !== invoices.length) {
        throw new ConflictException(`존재하지 않는 송장이 포함되어 있습니다.`);
      }

      const status = invoices[0].invoiceStatus;
      let nextStatus = status;
      for (const invoice of invoices) {
        if (invoice.invoiceStatus !== status)
          throw new BadRequestException(`배송상태가 같은 송장만 선택해야합니.`);
      }

      switch (status) {
        case 'WAIT_LOADING':
          nextStatus = 'WAIT_SHIPPING';
          break;
        case 'WAIT_SHIPPING':
          nextStatus = 'ON_SHIPPING';
          break;
        case 'ON_SHIPPING':
          nextStatus = 'DONE_SHIPPING';
          break;
        case 'DONE_SHIPPING':
          throw new BadRequestException(`이미 배송완료된 송장입니다.`);
      }

      await tx.invoice.updateMany({
        data: {
          invoiceStatus: nextStatus,
        },
        where: {
          id: {
            in: invoiceIds,
          },
        },
      });
    });
  }

  async backwardInvoiceStatus(companyId: number, invoiceIds: number[]) {
    await this.prisma.$transaction(async (tx) => {
      const invoices = await tx.invoice.findMany({
        where: {
          shipping: {
            companyId,
          },
          id: {
            in: invoiceIds,
          },
        },
      });
      if (invoiceIds.length !== invoices.length) {
        throw new ConflictException(`존재하지 않는 송장이 포함되어 있습니다.`);
      }

      const status = invoices[0].invoiceStatus;
      let nextStatus = status;
      for (const invoice of invoices) {
        if (invoice.invoiceStatus !== status)
          throw new BadRequestException(`배송상태가 같은 송장만 선택해야합니.`);
      }

      switch (status) {
        case 'WAIT_LOADING':
          throw new BadRequestException(`상차대기중인 송장입니다.`);
        case 'WAIT_SHIPPING':
          nextStatus = 'WAIT_LOADING';
          break;
        case 'ON_SHIPPING':
          nextStatus = 'WAIT_SHIPPING';
          break;
        case 'DONE_SHIPPING':
          nextStatus = 'ON_SHIPPING';
          break;
      }

      await tx.invoice.updateMany({
        data: {
          invoiceStatus: nextStatus,
        },
        where: {
          id: {
            in: invoiceIds,
          },
        },
      });
    });
  }

  async cancelInvoice(companyId: number, invoiceIds: number[]) {
    await this.prisma.$transaction(async (tx) => {
      const invoices = await tx.invoice.findMany({
        where: {
          shipping: {
            companyId,
          },
          id: {
            in: invoiceIds,
          },
        },
      });
      if (invoiceIds.length !== invoices.length) {
        throw new ConflictException(`존재하지 않는 송장이 포함되어 있습니다.`);
      }

      const status = invoices[0].invoiceStatus;
      let nextStatus = status;
      for (const invoice of invoices) {
        if (invoice.invoiceStatus !== status)
          throw new BadRequestException(`배송상태가 같은 송장만 선택해야합니.`);
      }

      switch (status) {
        case 'CANCELLED':
          throw new BadRequestException(`이미 취소된 송장입니다.`);
        case 'DONE_SHIPPING':
          nextStatus = 'CANCELLED';
      }

      await tx.invoice.updateMany({
        data: {
          invoiceStatus: nextStatus,
        },
        where: {
          id: {
            in: invoiceIds,
          },
        },
      });
    });
  }
}
