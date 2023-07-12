import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { DEPOSIT, ORDER_DEPOSIT, TAX_INVOICE } from 'src/common/selector';
import { PrismaService } from 'src/core';

@Injectable()
export class TaxInvoiceRetriveService {
  constructor(private prismaService: PrismaService) {}

  async getTaxInvoiceList(params: {
    companyId: number;
    skip: number;
    take: number;
  }): Promise<Model.TaxInvoice[]> {
    const data = await this.prismaService.taxInvoice.findMany({
      where: { companyId: params.companyId },
      skip: params.skip,
      take: params.take,
      select: TAX_INVOICE,
    });

    return data.map((ti) => {
      const suppliedPrice = ti.order.reduce((acc, cur) => {
        const tradePrice = cur.tradePrice.find(
          (tp) => tp.companyId === params.companyId,
        );

        return acc + tradePrice.suppliedPrice;
      }, 0);
      const vatPrice = ti.order.reduce((acc, cur) => {
        const tradePrice = cur.tradePrice.find(
          (tp) => tp.companyId === params.companyId,
        );

        return acc + tradePrice.vatPrice;
      }, 0);

      return Util.serialize({
        ...ti,
        // TODO: 데이터 추가
        partner: null,
        totalPrice: suppliedPrice + vatPrice,
        suppliedPrice,
        vatPrice,
      });
    });
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
