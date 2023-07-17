import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Order,
  OrderDeposit,
  OrderProcess,
  OrderStock,
  OrderType,
  PackagingType,
  PartnerTaxManager,
  Product,
} from '@prisma/client';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { TON_TO_GRAM } from 'src/common/const';
import {
  DEPOSIT,
  ORDER_DEPOSIT,
  PARTNER,
  TAX_INVOICE,
} from 'src/common/selector';
import { PrismaService } from 'src/core';

interface FindOrderItemStock {
  packaging: {
    type: PackagingType;
    name: string;
    packA: number;
    packB: number;
  };
  product: {
    paperDomain: {
      name: string;
    };
    paperGroup: {
      name: string;
    };
    paperType: {
      name: string;
    };
    manufacturer: {
      name: string;
    };
  };
  grammage: number;
  sizeX: number;
  sizeY: number;
  paperColorGroup: {
    name: string;
  };
  paperColor: {
    name: string;
  };
  paperPattern: {
    name: string;
  };
  paperCert: {
    name: string;
  };
  quantity: number;
}

interface FindOrderItem {
  orderNo: string;
  orderType: OrderType;
  dstDepositEvent: {
    id: number;
  } | null;
  orderStock: FindOrderItemStock | null;
  orderProcess: FindOrderItemStock | null;
  orderDeposit: FindOrderItemStock | null;
  orderEtc: { item: string };
}

@Injectable()
export class TaxInvoiceRetriveService {
  constructor(private prismaService: PrismaService) {}

  private getQuantity(
    packaging: {
      type: PackagingType;
      name: string;
      packA: number;
      packB: number;
    },
    quantity: number,
  ): string {
    switch (packaging.type) {
      case 'ROLL':
        return `${(quantity / TON_TO_GRAM).toFixed(3)}T`;
      case 'REAM':
      case 'SKID':
        return `${(quantity / 500).toFixed(3)}R`;
      case 'BOX':
        return `${quantity}BOX`;
      default:
        throw new InternalServerErrorException(`알 수 없는 재고 단위`);
    }
  }

  private getOrderItem(order: FindOrderItem): string {
    let orderType = '';
    let item = '';

    switch (order.orderType) {
      case 'NORMAL':
        orderType = order.dstDepositEvent ? '보관출고' : '정상매출';
        break;
      case 'DEPOSIT':
        orderType = '매출보관';
        break;
      case 'OUTSOURCE_PROCESS':
        orderType = '외주공정매출';
        break;
      case 'ETC':
        orderType = '기타매출';
        break;
    }

    if (order.orderType === 'NORMAL') {
      item =
        order.orderStock.packaging.type +
        ' ' +
        order.orderStock.product.paperType.name +
        ' ' +
        order.orderStock.grammage.toString() +
        'g/m²' +
        ' ' +
        `${order.orderStock.sizeX}X${order.orderStock.sizeY}` +
        ' ' +
        this.getQuantity(order.orderStock.packaging, order.orderStock.quantity);
    } else if (order.orderType === 'OUTSOURCE_PROCESS') {
      item =
        order.orderProcess.packaging.type +
        ' ' +
        order.orderProcess.product.paperType.name +
        ' ' +
        order.orderProcess.grammage.toString() +
        'g/m²' +
        ' ' +
        `${order.orderProcess.sizeX}X${order.orderProcess.sizeY}` +
        ' ' +
        this.getQuantity(
          order.orderProcess.packaging,
          order.orderProcess.quantity,
        );
    } else if (order.orderType === 'DEPOSIT') {
      item =
        order.orderDeposit.packaging.type +
        ' ' +
        order.orderDeposit.product.paperType.name +
        ' ' +
        order.orderDeposit.grammage.toString() +
        'g/m²' +
        ' ' +
        `${order.orderDeposit.sizeX}X${order.orderDeposit.sizeY}` +
        ' ' +
        this.getQuantity(
          order.orderDeposit.packaging,
          order.orderDeposit.quantity,
        );
    } else if (order.orderType === 'ETC') {
      item = order.orderEtc.item;
    }

    return `${orderType} ${order.orderNo} ${item}`;
  }

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
                in: data.map((ti) => ti.srcCompanyRegistrationNumber),
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
        const tradePrice =
          cur.tradePrice.find((tp) => tp.companyId === params.companyId) ||
          null;

        return acc + (tradePrice?.suppliedPrice || 0);
      }, 0);
      const vatPrice = ti.order.reduce((acc, cur) => {
        const tradePrice =
          cur.tradePrice.find((tp) => tp.companyId === params.companyId) ||
          null;

        return acc + (tradePrice?.vatPrice || 0);
      }, 0);

      return Util.serialize({
        ...ti,
        // TODO: 데이터 추가
        partner: partnerMap.get(ti.srcCompanyRegistrationNumber) || null,
        totalPrice: suppliedPrice + vatPrice,
        suppliedPrice,
        vatPrice,
        item:
          this.getOrderItem(ti.order[0]) +
          (ti.order.length > 1 ? ` 등 ${ti.order.length}` : ''),
        order: undefined,
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
      where: { id: params.id, isDeleted: false, companyId: params.companyId },
    });
    if (!taxInvoice) {
      throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
    }

    const partner = await this.prismaService.partner.findUnique({
      where: {
        companyId_companyRegistrationNumber: {
          companyId: taxInvoice.companyId,
          companyRegistrationNumber: taxInvoice.srcCompanyRegistrationNumber,
        },
      },
    });

    const suppliedPrice = taxInvoice.order.reduce((acc, cur) => {
      const tradePrice =
        cur.tradePrice.find((tp) => tp.companyId === params.companyId) || null;

      return acc + (tradePrice?.suppliedPrice || 0);
    }, 0);
    const vatPrice = taxInvoice.order.reduce((acc, cur) => {
      const tradePrice =
        cur.tradePrice.find((tp) => tp.companyId === params.companyId) || null;

      return acc + (tradePrice?.vatPrice || 0);
    }, 0);

    return Util.serialize({
      ...taxInvoice,
      partner: partner || null,
      totalPrice: suppliedPrice + vatPrice,
      suppliedPrice,
      vatPrice,
      item:
        this.getOrderItem(taxInvoice.order[0]) +
        (taxInvoice.order.length > 1 ? ` 등 ${taxInvoice.order.length}` : ''),
      order: undefined,
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
