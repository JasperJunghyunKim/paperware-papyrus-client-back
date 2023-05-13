import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core';
import { TradePriceUpdateRequest } from 'src/@shared/api/trade/order.request';

@Injectable()
export class TempService {
  constructor(private readonly prisma: PrismaService) {}

  async getTradePrice(companyId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      include: {
        tradePrice: {
          include: {
            orderStockTradePrice: {
              include: {
                orderStockTradeAltBundle: true,
              },
            },
          },
        },
      },
      where: {
        id: orderId,
        OR: [{ srcCompanyId: companyId }, { dstCompanyId: companyId }],
      },
    });
    if (!order) throw new NotFoundException('존재하지 않는 주문'); // 모듈 이동시 Exception 생성하여 처리

    const tradePrice =
      order.tradePrice.find((tp) => tp.companyId === companyId) || null;

    return tradePrice;
  }

  async updateTradePrice(
    companyId: number,
    orderId: number,
    tradePriceDto: TradePriceUpdateRequest,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        include: {
          tradePrice: {
            include: {
              orderStockTradePrice: {
                include: {
                  orderStockTradeAltBundle: true,
                },
              },
            },
          },
        },
        where: {
          id: orderId,
          OR: [{ srcCompanyId: companyId }, { dstCompanyId: companyId }],
        },
      });
      if (!order) throw new NotFoundException('존재하지 않는 주문'); // 모듈 이동시 Exception 생성하여 처리

      const tradePrice =
        (await tx.tradePrice.findFirst({
          where: {
            orderId: order.id,
            companyId: companyId,
          },
          include: {
            orderStockTradePrice: {
              include: {
                orderStockTradeAltBundle: true,
              },
            },
          },
        })) ??
        (await tx.tradePrice.create({
          data: {
            orderId: order.id,
            companyId: companyId,
            orderStockTradePrice: {
              create: {
                officialPriceType:
                  tradePriceDto.orderStockTradePrice.officialPriceType,
                officialPrice: tradePriceDto.orderStockTradePrice.officialPrice,
                officialPriceUnit:
                  tradePriceDto.orderStockTradePrice.officialPriceUnit,
                discountType: tradePriceDto.orderStockTradePrice.discountType,
                discountPrice: tradePriceDto.orderStockTradePrice.discountPrice,
                unitPrice: tradePriceDto.orderStockTradePrice.unitPrice,
                unitPriceUnit: tradePriceDto.orderStockTradePrice.unitPriceUnit,
                processPrice: tradePriceDto.orderStockTradePrice.processPrice,
              },
            },
          },
          include: {
            orderStockTradePrice: {
              include: {
                orderStockTradeAltBundle: true,
              },
            },
          },
        }));

      if (tradePrice.orderStockTradePrice) {
        if (!tradePriceDto.orderStockTradePrice)
          throw new BadRequestException(`orderStockTradePrice가 필요합니다.`);

        await tx.orderStockTradePrice.update({
          data: {
            officialPriceType:
              tradePriceDto.orderStockTradePrice.officialPriceType,
            officialPrice: tradePriceDto.orderStockTradePrice.officialPrice,
            officialPriceUnit:
              tradePriceDto.orderStockTradePrice.officialPriceUnit,
            discountType: tradePriceDto.orderStockTradePrice.discountType,
            discountPrice: tradePriceDto.orderStockTradePrice.discountPrice,
            unitPrice: tradePriceDto.orderStockTradePrice.unitPrice,
            unitPriceUnit: tradePriceDto.orderStockTradePrice.unitPriceUnit,
            processPrice: tradePriceDto.orderStockTradePrice.processPrice,
          },
          where: {
            orderId_companyId: {
              orderId: tradePriceDto.orderId,
              companyId: tradePriceDto.companyId,
            },
          },
        });

        if (tradePrice.orderStockTradePrice.orderStockTradeAltBundle) {
          await tx.orderStockTradeAltBundle.delete({
            where: {
              orderId_companyId: {
                orderId: tradePriceDto.orderId,
                companyId: tradePriceDto.companyId,
              },
            },
          });
        }

        const altBundle =
          tradePriceDto.orderStockTradePrice.orderStockTradeAltBundle;
        if (altBundle) {
          await tx.orderStockTradeAltBundle.create({
            data: {
              ...altBundle,
              orderId: tradePriceDto.orderId,
              companyId: tradePriceDto.companyId,
            },
          });
        }
      }

      await tx.tradePrice.update({
        data: {
          suppliedPrice: tradePriceDto.suppliedPrice,
          vatPrice: tradePriceDto.vatPrice,
        },
        where: {
          orderId_companyId: {
            orderId: tradePriceDto.orderId,
            companyId: tradePriceDto.companyId,
          },
        },
      });
    });
  }
}
