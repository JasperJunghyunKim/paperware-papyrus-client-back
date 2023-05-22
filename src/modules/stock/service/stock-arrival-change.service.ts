import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { StockChangeService } from './stock-change.service';
import { ulid } from 'ulid';

@Injectable()
export class StockArrivalChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockChangeService,
  ) { }

  async applyStockArrival(stockGroupId: number, companyId: number, warehouseId: number) {
    await this.prisma.$transaction(async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: {
          id: warehouseId,
          companyId,
          isDeleted: false,
        },
      });
      if (!warehouse) throw new NotFoundException(`존재하지 않는 창고입니다.`);

      const stockGroup = await tx.stockGroup.findUnique({
        include: {
          orderStock: {
            include: {
              order: true,
            }
          },
          stockGroupEvent: true,
          stockGroupPrice: true,
        },
        where: {
          id: stockGroupId,
        }
      });
      // TODO... 주문타입 추가되면 srcCompanyId가 아니라 dstCompanyId인 경우도 있음 => 추후 대응
      if (!stockGroup || stockGroup.isArrived !== false || stockGroup.orderStock.order.srcCompanyId !== companyId) {
        throw new ConflictException(`존재하지 않는 도착예정재고 입니다.`);
      }

      // 재고그룹 도착 처리
      await tx.stockGroup.update({
        where: {
          id: stockGroupId,
        },
        data: {
          isArrived: true,
        }
      });

      // 이동할 재고그룹 찾기 or 생성
      const storedStockGroup = await tx.stockGroup.findFirst({
        where: {
          productId: stockGroup.productId,
          packagingId: stockGroup.packagingId,
          grammage: stockGroup.grammage,
          sizeX: stockGroup.sizeX,
          sizeY: stockGroup.sizeY,
          paperColorGroupId: stockGroup.paperColorGroupId,
          paperColorId: stockGroup.paperColorId,
          paperPatternId: stockGroup.paperPatternId,
          paperCertId: stockGroup.paperCertId,
          warehouseId,
          companyId,
          isArrived: null,
          isDirectShipping: null,
        }
      }) || await tx.stockGroup.create({
        data: {
          product: {
            connect: {
              id: stockGroup.productId,
            }
          },
          packaging: {
            connect: {
              id: stockGroup.packagingId
            },
          },
          grammage: stockGroup.grammage,
          sizeX: stockGroup.sizeX,
          sizeY: stockGroup.sizeY,
          paperColorGroup: stockGroup.paperColorGroupId ? {
            connect: {
              id: stockGroup.paperColorGroupId,
            },
          } : undefined,
          paperColor: stockGroup.paperColorId ? {
            connect: {
              id: stockGroup.paperColorId,
            },
          } : undefined,
          paperPattern: stockGroup.paperPatternId ? {
            connect: {
              id: stockGroup.paperPatternId,
            },
          } : undefined,
          paperCert: stockGroup.paperCertId ? {
            connect: {
              id: stockGroup.paperCertId,
            },
          } : undefined,
          warehouse: {
            connect: {
              id: warehouseId,
            },
          },
          company: {
            connect: {
              id: companyId,
            },
          },
          isArrived: null,
          isDirectShipping: null,
        },
      });

      // 재고 생성 
      await tx.stock.create({
        data: {
          serial: ulid(),
          company: {
            connect: {
              id: companyId,
            }
          },
          warehouse: {
            connect: {
              id: warehouseId,
            }
          },
          product: {
            connect: {
              id: stockGroup.productId,
            }
          },
          packaging: {
            connect: {
              id: stockGroup.packagingId
            },
          },
          grammage: stockGroup.grammage,
          sizeX: stockGroup.sizeX,
          sizeY: stockGroup.sizeY,
          paperColorGroup: stockGroup.paperColorGroupId ? {
            connect: {
              id: stockGroup.paperColorGroupId,
            },
          } : undefined,
          paperColor: stockGroup.paperColorId ? {
            connect: {
              id: stockGroup.paperColorId,
            },
          } : undefined,
          paperPattern: stockGroup.paperPatternId ? {
            connect: {
              id: stockGroup.paperPatternId,
            },
          } : undefined,
          paperCert: stockGroup.paperCertId ? {
            connect: {
              id: stockGroup.paperCertId,
            },
          } : undefined,
          isSyncPrice: stockGroup.isSyncPrice,
          stockPrice: !stockGroup.isSyncPrice ? {
            create: {
              officialPriceType: stockGroup.stockGroupPrice.officialPriceType,
              officialPrice: stockGroup.stockGroupPrice.officialPrice,
              officialPriceUnit: stockGroup.stockGroupPrice.officialPriceUnit,
              discountType: stockGroup.stockGroupPrice.discountType,
              unitPrice: stockGroup.stockGroupPrice.unitPrice,
              discountPrice: stockGroup.stockGroupPrice.discountPrice,
              unitPriceUnit: stockGroup.stockGroupPrice.unitPriceUnit,
            }
          } : undefined,
          // stock event 추가
        },
      });

      // 재고그룹에 이벤트 생성 (다른작업에 배정되어 마이너스 된것. 가상.)


      // const se = await tx.stockEvent.update({
      //   where: {
      //     id,
      //   },
      //   data: {
      //     status: 'NORMAL',
      //   },
      //   select: {
      //     stockId: true,
      //   },
      // });

      // await tx.stock.update({
      //   data: {
      //     warehouseId,
      //   },
      //   where: {
      //     id: se.stockId,
      //   },
      // });

      // await this.stock.cacheStockQuantityTx(tx, {
      //   id: se.stockId,
      // });
    });
  }
}
