import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class StockArrivalRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getStockArrivalList(params: {
    skip?: number;
    take?: number;
    companyId: number;
  }): Promise<Model.ArrivalStockGroup[]> {
    const { skip, take, companyId } = params;

    const items = await this.prisma.stockGroup.findMany({
      include: {
        stockGroupEvent: true,
        plan: {
          include: {
            orderStock: {
              include: {
                warehouse: {
                  include: {
                    company: true,
                  }
                },
                dstLocation: {
                  include: {
                    company: true,
                  }
                },
                order: {
                  include: {
                    srcCompany: true,
                    dstCompany: true,
                  }
                },
                product: {
                  include: {
                    paperDomain: true,
                    manufacturer: true,
                    paperGroup: true,
                    paperType: true,
                  }
                },
                packaging: true,
                paperColorGroup: true,
                paperColor: true,
                paperPattern: true,
                paperCert: true,
              }
            }
          }
        },
        product: {
          include: {
            paperDomain: true,
            manufacturer: true,
            paperGroup: true,
            paperType: true,
          }
        },
        packaging: true,
        paperColorGroup: true,
        paperColor: true,
        paperPattern: true,
        paperCert: true,
      },
      where: {
        companyId,
        stockGroupEvent: {
          some: {
            status: {
              not: 'PENDING',
            }
          }
        }
      }
    });

    return items.map(item => {
      const totalQuantity = item.stockGroupEvent.reduce((prev, cur) => {
        return prev + cur.change;
      }, 0);
      const storingQuantity = item.stockGroupEvent.filter(item => item.change > 0)
        .reduce((prev, cur) => {
          return prev + cur.change;
        }, 0);

      const orderCompany = (item.plan?.orderStock?.order?.srcCompany.id === companyId ?
        item.plan?.orderStock?.order?.dstCompany :
        item.plan?.orderStock?.order?.srcCompany) || null;

      return {
        id: item.id,
        company: null, // 도착예정재고 => 자신의 회사이므로 정보 필요X
        product: item.product,
        packaging: item.packaging,
        grammage: item.grammage,
        sizeX: item.sizeX,
        sizeY: item.sizeY,
        paperColorGroup: item.paperColorGroup,
        paperColor: item.paperColor,
        paperPattern: item.paperPattern,
        paperCert: item.paperCert,
        warehouse: null, // 도착예정재고 => 창고 null
        orderCompanyInfo: orderCompany,
        orderInfo: item.plan?.orderStock?.order ? {
          wantedDate: item.plan?.orderStock?.order?.wantedDate.toISOString(),
        } : null,
        orderStock: item.plan?.orderStock ? {
          id: item.plan.orderStock.id,
          orderId: item.plan.orderStock.orderId,
          dstLocation: item.plan.orderStock.dstLocation,
          warehouse: item.plan.orderStock.warehouse,
          product: item.plan.orderStock.product,
          packaging: item.plan.orderStock.packaging,
          grammage: item.plan.orderStock.grammage,
          sizeX: item.plan.orderStock.sizeX,
          sizeY: item.plan.orderStock.sizeY,
          paperColorGroup: item.plan.orderStock.paperColorGroup,
          paperColor: item.plan.orderStock.paperColor,
          paperPattern: item.plan.orderStock.paperPattern,
          paperCert: item.plan.orderStock.paperCert,
          quantity: item.plan.orderStock.quantity,
          plan: item.plan ? {
            id: item.plan.id,
            planNo: item.plan.planNo,
          } : null,
        } : null,
        totalQuantity,
        storingQuantity,
        nonStoringQuantity: totalQuantity - storingQuantity,
      }
    });
  }

  async getStockArrivalCount(params: { companyId: number }) {
    return await this.prisma.stockGroupEvent.count({
      where: {
        status: 'PENDING',
        stockGroup: {
          companyId: params.companyId,
        },
        change: {
          gt: 0,
        },
      },
    });
  }
}