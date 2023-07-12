import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { DEPOSIT, ORDER_DEPOSIT } from 'src/common/selector';
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

  async getOrders(
    companyId: number,
    taxInvoiceId: number,
  ): Promise<Model.Order[]> {
    const orders = await this.prismaService.order.findMany({
      select: {
        ...Selector.ORDER,
        orderDeposit: {
          select: ORDER_DEPOSIT,
        },
        srcDepositEvent: {
          include: {
            deposit: {
              select: DEPOSIT,
            },
          },
        },
        dstDepositEvent: {
          include: {
            deposit: {
              select: DEPOSIT,
            },
          },
        },
      },
      where: {
        taxInvoiceId,
        dstCompanyId: companyId,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return orders.map(Util.serialize);
  }
}
