import { Injectable, NotFoundException } from '@nestjs/common';
import { PartnerTaxManager } from '@prisma/client';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import {
  DEPOSIT,
  ORDER_DEPOSIT,
  PARTNER,
  TAX_INVOICE,
} from 'src/common/selector';
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
      where: { companyId: params.companyId, isDeleted: false },
      skip: params.skip,
      take: params.take,
      select: TAX_INVOICE,
    });

    const partners =
      data.length > 0
        ? await this.prismaService.partner.findMany({
            select: PARTNER,
            where: {
              companyId: params.companyId,
              companyRegistrationNumber: {
                in: data.map((ti) => ti.companyRegistrationNumber),
              },
            },
          })
        : [];
    const partnerMap = new Map<
      string,
      {
        companyRegistrationNumber: string;
        memo: string;
        companyId: number;
        partnerNickName: string;
        creditLimit: number;
        partnerTaxManager: PartnerTaxManager[];
      }
    >();

    for (const partner of partners) {
      partnerMap.set(partner.companyRegistrationNumber, partner);
    }

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
        partner: partnerMap.get(ti.companyRegistrationNumber) || null,
        totalPrice: suppliedPrice + vatPrice,
        suppliedPrice,
        vatPrice,
      });
    });
  }

  async getTaxInvoiceCount(params: { companyId: number }) {
    const data = await this.prismaService.taxInvoice.count({
      where: { companyId: params.companyId, isDeleted: false },
    });

    return data;
  }

  async getTaxInvoiceItem(params: {
    companyId: number;
    id: number;
  }): Promise<Model.TaxInvoice> {
    const taxInvoice = await this.prismaService.taxInvoice.findFirst({
      select: TAX_INVOICE,
      where: { id: params.id, isDeleted: true, companyId: params.companyId },
    });
    if (!taxInvoice) {
      throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
    }

    const partner = await this.prismaService.partner.findUnique({
      where: {
        companyId_companyRegistrationNumber: {
          companyId: taxInvoice.companyId,
          companyRegistrationNumber: taxInvoice.companyRegistrationNumber,
        },
      },
    });

    const suppliedPrice = taxInvoice.order.reduce((acc, cur) => {
      const tradePrice = cur.tradePrice.find(
        (tp) => tp.companyId === params.companyId,
      );

      return acc + tradePrice.suppliedPrice;
    }, 0);
    const vatPrice = taxInvoice.order.reduce((acc, cur) => {
      const tradePrice = cur.tradePrice.find(
        (tp) => tp.companyId === params.companyId,
      );

      return acc + tradePrice.vatPrice;
    }, 0);

    return Util.serialize({
      ...taxInvoice,
      partner: partner || null,
      totalPrice: suppliedPrice + vatPrice,
      suppliedPrice,
      vatPrice,
    });
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
