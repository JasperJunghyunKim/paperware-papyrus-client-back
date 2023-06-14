import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import { PACKAGING, PAPER_CERT, PAPER_COLOR, PAPER_COLOR_GROUP, PAPER_PATTERN, PRODUCT, STOCK_PRICE } from 'src/common/selector';
import { PrismaService } from 'src/core';

@Injectable()
export class StockArrivalRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getDetail(params: {
    companyId: number;
    planId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
  }): Promise<Model.ArrivalStock> {
    const stock = await this.prisma.stock.findFirst({
      select: {
        stockEvent: true,
        isSyncPrice: true,
        initialPlan: {
          include: {
            orderStock: {
              include: {
                order: {
                  include: {
                    tradePrice: {
                      include: {
                        orderStockTradePrice: true,
                        orderDepositTradePrice: true,
                      }
                    }
                  }
                }
              }
            }
          }
        },
        stockPrice: {
          select: STOCK_PRICE,
        },
        packaging: {
          select: PACKAGING,
        },
        product: {
          select: PRODUCT,
        },
        grammage: true,
        sizeX: true,
        sizeY: true,
        paperColorGroup: {
          select: PAPER_COLOR_GROUP,
        },
        paperColor: {
          select: PAPER_COLOR,
        },
        paperPattern: {
          select: PAPER_PATTERN,
        },
        paperCert: {
          select: PAPER_CERT,
        }
      },
      where: {
        companyId: params.companyId,
        planId: params.planId,
        productId: params.productId,
        packagingId: params.packagingId,
        grammage: params.grammage,
        sizeX: params.sizeX,
        sizeY: params.sizeY || 0,
        paperColorGroupId: params.paperColorGroupId,
        paperColorId: params.paperColorId,
        paperPatternId: params.paperPatternId,
        paperCertId: params.paperCertId,
        warehouseId: null,
      }
    });
    if (!stock) throw new NotFoundException(`존재하지 않는 도착예정재고 입니다.`);

    const tradePrice = stock.initialPlan?.orderStock?.order?.tradePrice?.find(tp => tp.companyId === params.companyId) || null;

    return {
      packaging: stock.packaging,
      product: stock.product,
      grammage: stock.grammage,
      sizeX: stock.sizeX,
      sizeY: stock.sizeY,
      paperColorGroup: stock.paperColorGroup,
      paperColor: stock.paperColor,
      paperPattern: stock.paperPattern,
      paperCert: stock.paperCert,
      isSyncPrice: stock.isSyncPrice,
      stockPrice: stock.stockPrice,
      tradePrice: tradePrice && tradePrice.orderStockTradePrice ? {
        officialPriceType: tradePrice.orderStockTradePrice.officialPriceType,
        officialPrice: tradePrice.orderStockTradePrice.officialPrice,
        officialPriceUnit: tradePrice.orderStockTradePrice.officialPriceUnit,
        discountType: tradePrice.orderStockTradePrice.discountType,
        discountPrice: tradePrice.orderStockTradePrice.discountPrice,
        unitPrice: tradePrice.orderStockTradePrice.unitPrice,
        unitPriceUnit: tradePrice.orderStockTradePrice.unitPriceUnit,
      } : null,
    };
  }
}
