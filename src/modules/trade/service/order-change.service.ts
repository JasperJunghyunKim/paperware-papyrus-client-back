import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType, OfficialPriceType, PriceUnit } from '@prisma/client';
import { Model } from 'src/@shared';
import { StockCreateStockPriceRequest } from 'src/@shared/api';
import { Selector, Util } from 'src/common';
import { PrismaService } from 'src/core';
import { StockChangeService } from 'src/modules/stock/service/stock-change.service';
import { PlanChangeService } from 'src/modules/working/service/plan-change.service';
import { ulid } from 'ulid';
import { TradePriceValidator } from './trade-price.validator';

interface UpdateTradePriceParams {
  orderId: number;
  companyId: number;
  suppliedPrice: number;
  vatPrice: number;
  orderStockTradePrice?: {
    officialPriceType: OfficialPriceType;
    officialPrice: number;
    officialPriceUnit: PriceUnit;
    discountType: DiscountType;
    discountPrice: number;
    unitPrice: number;
    unitPriceUnit: PriceUnit;
    processPrice: number;
    orderStockTradeAltBundle?: {
      altSizeX: number;
      altSizeY: number;
      altQuantity: number;
    };
  };
}

@Injectable()
export class OrderChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planChange: PlanChangeService,
    private readonly stockChangeService: StockChangeService,
    private readonly tradePriceValidator: TradePriceValidator,
  ) { }

  /** 정상거래 주문 생성 */
  async createStockOrder(params: {
    srcCompanyId: number;
    dstCompanyId: number;
    locationId: number;
    warehouseId: number | null;
    orderStockId: number | null;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    memo: string;
    wantedDate: string;
    isOffer: boolean;
  }): Promise<Model.Order> {
    const {
      srcCompanyId,
      dstCompanyId,
      locationId,
      warehouseId,
      orderStockId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      quantity,
      memo,
      wantedDate,
    } = params;

    // await this.checkStock({
    //   warehouseId,
    //   orderStockId,
    //   productId,
    //   packagingId,
    //   grammage,
    //   sizeX,
    //   sizeY,
    //   paperColorGroupId,
    //   paperColorId,
    //   paperPatternId,
    //   paperCertId,
    //   quantity,
    // });

    // const isEntrusted =
    //   !!(
    //     await this.prisma.company.findUnique({
    //       where: {
    //         id: srcCompanyId,
    //       },
    //       select: {
    //         managedById: true,
    //       },
    //     })
    //   ).managedById ||
    //   !!(
    //     await this.prisma.company.findUnique({
    //       where: {
    //         id: dstCompanyId,
    //       },
    //       select: {
    //         managedById: true,
    //       },
    //     })
    //   ).managedById;

    // const created = await this.prisma.order.create({
    //   select: Selector.ORDER,
    //   data: {
    //     orderNo: ulid(),
    //     orderType: 'NORMAL',
    //     srcCompany: {
    //       connect: {
    //         id: srcCompanyId,
    //       },
    //     },
    //     dstCompany: {
    //       connect: {
    //         id: dstCompanyId,
    //       },
    //     },
    //     status: params.isOffer ? 'OFFER_PREPARING' : 'ORDER_PREPARING',
    //     isEntrusted,
    //     memo,
    //     wantedDate,
    //     orderStock: {
    //       create: {
    //         dstLocationId: locationId,
    //         warehouseId,
    //         orderStockId,
    //         productId,
    //         packagingId,
    //         grammage,
    //         sizeX,
    //         sizeY,
    //         paperColorGroupId,
    //         paperColorId,
    //         paperPatternId,
    //         paperCertId,
    //         quantity,
    //       },
    //     },
    //   },
    // });

    // return Util.serialize(created);
    return null;
  }

  async updateStockOrder(params: {
    orderId: number;
    locationId: number;
    warehouseId: number | null;
    orderStockId: number | null;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    memo: string;
    wantedDate: string;
  }) {
    const {
      orderId,
      locationId,
      warehouseId,
      orderStockId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      quantity,
      memo,
      wantedDate,
    } = params;

    // await this.checkStock({
    //   warehouseId,
    //   orderStockId,
    //   productId,
    //   packagingId,
    //   grammage,
    //   sizeX,
    //   sizeY,
    //   paperColorGroupId,
    //   paperColorId,
    //   paperPatternId,
    //   paperCertId,
    //   quantity,
    // });

    // await this.prisma.order.update({
    //   where: {
    //     id: orderId,
    //   },
    //   data: {
    //     memo,
    //     wantedDate,
    //     orderStock: {
    //       update: {
    //         dstLocationId: locationId,
    //         warehouseId,
    //         orderStockId,
    //         productId,
    //         packagingId,
    //         grammage,
    //         sizeX,
    //         sizeY,
    //         paperColorGroupId,
    //         paperColorId,
    //         paperPatternId,
    //         paperCertId,
    //         quantity,
    //       },
    //     },
    //   },
    // });
  }

  async checkStock(params: {
    warehouseId: number | null;
    orderStockId: number | null;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
  }) {
    const order = params.orderStockId
      ? await this.prisma.orderStock.findUnique({
        where: {
          id: params.orderStockId,
        },
        select: {
          orderId: true,
        },
      })
      : null;

    const quantity = await this.prisma.stockEvent.findMany({
      where: {
        stock: {
          warehouseId: params.warehouseId,
          // initialOrderId: order?.orderId ?? null,
          productId: params.productId,
          packagingId: params.packagingId,
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY,
          paperColorGroupId: params.paperColorGroupId,
          paperColorId: params.paperColorId,
          paperPatternId: params.paperPatternId,
          paperCertId: params.paperCertId,
        },
      },
      select: {
        change: true,
        status: true,
      },
    });

    const total = quantity.reduce((acc, cur) => {
      return acc + (cur.status === 'CANCELLED' ? 0 : cur.change);
    }, 0);

    if (total < params.quantity) {
      throw new BadRequestException(
        `재고가 부족합니다. 가용수량 이내로 수량을 입력해주세요.`,
      );
    }
  }

  async request(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_PREPARING'
              ? 'OFFER_REQUESTED'
              : 'ORDER_REQUESTED',
        },
      });
    });
  }

  async cancel(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_PREPARING'
              ? 'OFFER_CANCELLED'
              : 'ORDER_CANCELLED',
        },
      });
    });
  }

  async accept(params: { orderId: number }) {
    const { orderId } = params;

    // await this.prisma.$transaction(async (tx) => {
    //   const order = await tx.order.findUnique({
    //     where: {
    //       id: orderId,
    //     },
    //     select: {
    //       status: true,
    //       dstCompany: true,
    //       orderStock: true,
    //     },
    //   });

    //   if (
    //     !Util.inc(
    //       order.status,
    //       'OFFER_REQUESTED',
    //       'ORDER_REQUESTED',
    //       'OFFER_PREPARING',
    //       'ORDER_PREPARING',
    //     )
    //   ) {
    //     throw new Error('Invalid order status');
    //   }

    //   if (!order.dstCompany.managedById && order.orderStock) {
    //     // TODO: Plan 생성
    //     await this.planChange.createPlanWithOrder(tx, {
    //       companyId: order.dstCompany.id,
    //       orderStockId: order.orderStock.id,
    //       warehouseId: order.orderStock.warehouseId ?? null,
    //       orderStockIdOrig: order.orderStock.orderStockId ?? null,
    //       productId: order.orderStock.productId,
    //       packagingId: order.orderStock.packagingId,
    //       grammage: order.orderStock.grammage,
    //       sizeX: order.orderStock.sizeX,
    //       sizeY: order.orderStock.sizeY,
    //       paperColorGroupId: order.orderStock.paperColorGroupId,
    //       paperColorId: order.orderStock.paperColorId,
    //       paperPatternId: order.orderStock.paperPatternId,
    //       paperCertId: order.orderStock.paperCertId,
    //       quantity: order.orderStock.quantity,
    //       memo: '',
    //     });
    //   }

    //   await tx.order.update({
    //     where: {
    //       id: orderId,
    //     },
    //     data: {
    //       status: 'ACCEPTED',
    //     },
    //   });
    // });
  }

  async reject(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (!Util.inc(order.status, 'OFFER_REQUESTED', 'ORDER_REQUESTED')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_REQUESTED'
              ? 'OFFER_REJECTED'
              : 'ORDER_REJECTED',
        },
      });
    });
  }

  async reset(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (!Util.inc(order.status, 'OFFER_REJECTED', 'ORDER_REJECTED')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_REJECTED'
              ? 'OFFER_PREPARING'
              : 'ORDER_PREPARING',
        },
      });
    });
  }

  async createArrival(params: {
    orderId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    isSyncPrice: boolean;
    stockPrice: StockCreateStockPriceRequest;
  }) {
    const {
      orderId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      quantity,
      isSyncPrice,
      stockPrice,
    } = params;

    // await this.prisma.$transaction(async (tx) => {
    //   const order = await tx.order.findUnique({
    //     where: {
    //       id: orderId,
    //     },
    //     select: {
    //       srcCompanyId: true,
    //       orderStock: true,
    //     },
    //   });

    //   // TODO: 상태 체크

    //   const stockGroup = await tx.stockGroup.findFirst({
    //     where: {
    //       productId,
    //       packagingId,
    //       grammage,
    //       sizeX,
    //       sizeY,
    //       paperColorGroupId,
    //       paperColorId,
    //       paperPatternId,
    //       paperCertId,
    //       warehouseId: null,
    //       orderStockId: order.orderStock.id,
    //       companyId: order.srcCompanyId,
    //     },
    //   });
    //   if (stockGroup)
    //     throw new ConflictException(`이미 존재하는 재고스펙입니다.`);

    //   await tx.stockGroup.create({
    //     data: {
    //       productId,
    //       packagingId,
    //       grammage,
    //       sizeX,
    //       sizeY,
    //       paperColorGroupId,
    //       paperColorId,
    //       paperPatternId,
    //       paperCertId,
    //       warehouseId: null,
    //       orderStockId: order.orderStock.id,
    //       companyId: order.srcCompanyId,
    //       isArrived: false,
    //       isDirectShipping: false,
    //       isSyncPrice,
    //       stockGroupEvent: {
    //         create: {
    //           change: quantity,
    //           status: 'PENDING',
    //         },
    //       },
    //       stockGroupPrice: stockPrice
    //         ? {
    //           create: {
    //             officialPriceType: stockPrice.officialPriceType,
    //             officialPrice: stockPrice.officialPrice,
    //             officialPriceUnit: stockPrice.officialPriceUnit,
    //             discountType: stockPrice.discountType,
    //             discountPrice: stockPrice.discountPrice,
    //             unitPrice: stockPrice.unitPrice,
    //             unitPriceUnit: stockPrice.unitPriceUnit,
    //           },
    //         }
    //         : undefined,
    //     },
    //   });
    // });
  }

  /** 거래금액 수정 */
  async updateTradePrice(
    companyId: number,
    orderId: number,
    tradePriceDto: UpdateTradePriceParams,
  ) {
    // await this.prisma.$transaction(async (tx) => {
    //   const order = await tx.order.findFirst({
    //     include: {
    //       tradePrice: {
    //         include: {
    //           orderStockTradePrice: {
    //             include: {
    //               orderStockTradeAltBundle: true,
    //             },
    //           },
    //         },
    //       },
    //       orderStock: {
    //         include: {
    //           packaging: true,
    //         },
    //       },
    //     },
    //     where: {
    //       id: orderId,
    //       OR: [{ srcCompanyId: companyId }, { dstCompanyId: companyId }],
    //     },
    //   });
    //   if (!order) throw new NotFoundException('존재하지 않는 주문'); // 모듈 이동시 Exception 생성하여 처리

    //   // 금액정보 validation
    //   this.tradePriceValidator.validateTradePrice(
    //     order.orderStock.packaging.type,
    //     tradePriceDto,
    //   );

    //   const tradePrice =
    //     (await tx.tradePrice.findFirst({
    //       where: {
    //         orderId: order.id,
    //         companyId: companyId,
    //       },
    //       include: {
    //         orderStockTradePrice: {
    //           include: {
    //             orderStockTradeAltBundle: true,
    //           },
    //         },
    //       },
    //     })) ??
    //     (await tx.tradePrice.create({
    //       data: {
    //         orderId: order.id,
    //         companyId: companyId,
    //         orderStockTradePrice: {
    //           create: {
    //             officialPriceType:
    //               tradePriceDto.orderStockTradePrice.officialPriceType,
    //             officialPrice: tradePriceDto.orderStockTradePrice.officialPrice,
    //             officialPriceUnit:
    //               tradePriceDto.orderStockTradePrice.officialPriceUnit,
    //             discountType: tradePriceDto.orderStockTradePrice.discountType,
    //             discountPrice: tradePriceDto.orderStockTradePrice.discountPrice,
    //             unitPrice: tradePriceDto.orderStockTradePrice.unitPrice,
    //             unitPriceUnit: tradePriceDto.orderStockTradePrice.unitPriceUnit,
    //             processPrice: tradePriceDto.orderStockTradePrice.processPrice,
    //           },
    //         },
    //       },
    //       include: {
    //         orderStockTradePrice: {
    //           include: {
    //             orderStockTradeAltBundle: true,
    //           },
    //         },
    //       },
    //     }));
    //   if (tradePrice.isBookClosed) {
    //     throw new ConflictException(`이미 마감된 주문정보 입니다.`);
    //   }

    //   if (tradePrice.orderStockTradePrice) {
    //     if (!tradePriceDto.orderStockTradePrice)
    //       throw new BadRequestException(`orderStockTradePrice가 필요합니다.`); // TODO... Exception 추가

    //     await tx.orderStockTradePrice.update({
    //       data: {
    //         officialPriceType:
    //           tradePriceDto.orderStockTradePrice.officialPriceType,
    //         officialPrice: tradePriceDto.orderStockTradePrice.officialPrice,
    //         officialPriceUnit:
    //           tradePriceDto.orderStockTradePrice.officialPriceUnit,
    //         discountType: tradePriceDto.orderStockTradePrice.discountType,
    //         discountPrice: tradePriceDto.orderStockTradePrice.discountPrice,
    //         unitPrice: tradePriceDto.orderStockTradePrice.unitPrice,
    //         unitPriceUnit: tradePriceDto.orderStockTradePrice.unitPriceUnit,
    //         processPrice: tradePriceDto.orderStockTradePrice.processPrice,
    //       },
    //       where: {
    //         orderId_companyId: {
    //           orderId: tradePriceDto.orderId,
    //           companyId: tradePriceDto.companyId,
    //         },
    //       },
    //     });

    //     if (tradePrice.orderStockTradePrice.orderStockTradeAltBundle) {
    //       await tx.orderStockTradeAltBundle.delete({
    //         where: {
    //           orderId_companyId: {
    //             orderId: tradePriceDto.orderId,
    //             companyId: tradePriceDto.companyId,
    //           },
    //         },
    //       });
    //     }

    //     const altBundle =
    //       tradePriceDto.orderStockTradePrice.orderStockTradeAltBundle;
    //     if (altBundle) {
    //       await tx.orderStockTradeAltBundle.create({
    //         data: {
    //           ...altBundle,
    //           orderId: tradePriceDto.orderId,
    //           companyId: tradePriceDto.companyId,
    //         },
    //       });
    //     }
    //   }

    //   await tx.tradePrice.update({
    //     data: {
    //       suppliedPrice: tradePriceDto.suppliedPrice,
    //       vatPrice: tradePriceDto.vatPrice,
    //     },
    //     where: {
    //       orderId_companyId: {
    //         orderId: tradePriceDto.orderId,
    //         companyId: tradePriceDto.companyId,
    //       },
    //     },
    //   });
    // });
  }

  /** 보관 등록 */
  async createDepositOrder(
    srcCompanyId: number,
    dstCompanyId: number,
    isOffer: boolean,
    productId: number,
    packagingId: number,
    grammage: number,
    sizeX: number,
    sizeY: number,
    paperColorGroupId: number | null,
    paperColorId: number | null,
    paperPatternId: number | null,
    paperCertId: number | null,
    quantity: number,
  ) {
    await this.prisma.$transaction(async tx => {
      const dstCompany = await tx.company.findUnique({
        where: {
          id: dstCompanyId,
        }
      });
      if (!dstCompany) throw new NotFoundException(`등록되지 않은 거래처입니다.`);
      const partner = await tx.partner.findUnique({
        where: {
          companyId_companyRegistrationNumber: {
            companyId: srcCompanyId,
            companyRegistrationNumber: dstCompany.companyRegistrationNumber,
          }
        }
      })
      if (!partner) throw new NotFoundException(`등록되지 않은 거래처입니다.`);

      const isEntrusted =
        !!(
          await tx.company.findUnique({
            where: {
              id: srcCompanyId,
            },
            select: {
              managedById: true,
            },
          })
        ).managedById ||
        !!(
          await tx.company.findUnique({
            where: {
              id: dstCompanyId,
            },
            select: {
              managedById: true,
            },
          })
        ).managedById;

      // 주문 생성
      const order = await tx.order.create({
        select: {
          id: true,
        },
        data: {
          orderNo: ulid(),
          orderType: 'DEPOSIT',
          srcCompany: {
            connect: {
              id: srcCompanyId,
            }
          },
          dstCompany: {
            connect: {
              id: dstCompanyId,
            }
          },
          status: isOffer ? 'OFFER_PREPARING' : 'ORDER_PREPARING',
          isEntrusted,
          memo: '',
        }
      });

      // order deposit 생성
      await tx.orderDeposit.create({
        data: {
          product: {
            connect: {
              id: productId,
            }
          },
          packaging: {
            connect: {
              id: packagingId,
            }
          },
          grammage,
          sizeX,
          sizeY,
          paperColorGroup: paperColorGroupId ? {
            connect: {
              id: paperColorGroupId,
            }
          } : undefined,
          paperColor: paperColorId ? {
            connect: {
              id: paperColorId,
            }
          } : undefined,
          paperPattern: paperPatternId ? {
            connect: {
              id: paperPatternId,
            }
          } : undefined,
          paperCert: paperCertId ? {
            connect: {
              id: paperCertId,
            }
          } : undefined,
          quantity,
          order: {
            connect: {
              id: order.id
            }
          },
        }
      });
    });
  }
}
