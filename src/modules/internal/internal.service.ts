import { Record, Selector } from 'src/common';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class InternalService {
  constructor(private prisma: PrismaService) {}

  // #region Warehouse
  async getWarehouse(where: Prisma.WarehouseWhereUniqueInput) {
    return await this.prisma.warehouse.findUnique({
      select: {
        id: true,
        name: true,
        code: true,
        isPublic: true,
        address: true,
        companyId: true,
      },
      where,
    });
  }

  async getWarehouseList(params: {
    skip?: number;
    take?: number;
    where?: Prisma.WarehouseWhereInput;
    orderBy?: Prisma.WarehouseOrderByWithRelationInput;
  }): Promise<Record.Warehouse[]> {
    return await this.prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        isPublic: true,
        address: true,
      },
      ...params,
    });
  }

  async getWarehouseCount(params: { where?: Prisma.WarehouseWhereInput }) {
    const { where } = params;
    return await this.prisma.warehouse.count({
      where,
    });
  }

  async createWarehouse(data: Prisma.WarehouseCreateInput) {
    return await this.prisma.warehouse.create({
      data,
    });
  }

  async updateWarehouse(params: {
    where: Prisma.WarehouseWhereUniqueInput;
    data: Prisma.WarehouseUpdateInput;
  }) {
    const { where, data } = params;
    return await this.prisma.warehouse.update({
      data,
      where,
    });
  }
  // #endregion

  // #region Location
  async getLocation(where: Prisma.LocationWhereUniqueInput) {
    return await this.prisma.location.findUnique({
      select: {
        id: true,
        name: true,
        code: true,
        isPublic: true,
        address: true,
        companyId: true,
      },
      where,
    });
  }

  async getLocationList(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LocationWhereInput;
    orderBy?: Prisma.LocationOrderByWithRelationInput;
  }): Promise<Record.Location[]> {
    const { skip, take, where, orderBy } = params;
    return await this.prisma.location.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        isPublic: true,
        address: true,
      },
      skip,
      take,
      where,
      orderBy,
    });
  }

  async getLocationCount(params: { where?: Prisma.LocationWhereInput }) {
    const { where } = params;
    return await this.prisma.location.count({
      where,
    });
  }

  async createLocation(data: Prisma.LocationCreateInput) {
    return await this.prisma.location.create({
      data,
    });
  }

  async updateLocation(params: {
    where: Prisma.LocationWhereUniqueInput;
    data: Prisma.LocationUpdateInput;
  }) {
    const { where, data } = params;
    return await this.prisma.location.update({
      data,
      where,
    });
  }
  // #endregion

  // #region Stock
  async getStock(where: Prisma.StockWhereUniqueInput) {
    return await this.prisma.stock.findUnique({
      select: Selector.STOCK,
      where,
    });
  }

  async getStockList(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StockWhereInput;
    orderBy?: Prisma.StockOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;

    return await this.prisma.stock.findMany({
      select: Selector.STOCK,
      skip,
      take,
      where,
      orderBy,
    });
  }

  async getStockCount(params: { where?: Prisma.StockWhereInput }) {
    const { where } = params;
    return await this.prisma.stock.count({
      where,
    });
  }

  async createStock(data: Prisma.StockCreateInput, initialQuantity: number) {
    const stock = await this.prisma.$transaction(async (tx) => {
      const stock = await tx.stock.create({
        data,
        select: {
          id: true,
        },
      });
      await tx.stockEvent.create({
        data: {
          stock: {
            connect: {
              id: stock.id,
            },
          },
          change: initialQuantity,
          status: 'NORMAL',
        },
      });
      return stock;
    });

    await this.cacheStockQuantity({
      id: stock.id,
    });

    return stock;
  }

  async updateStock(params: {
    where: Prisma.StockWhereUniqueInput;
    data: Prisma.StockUpdateInput;
  }) {
    const { where, data } = params;
    await this.prisma.stock.update({
      data,
      where,
    });

    await this.cacheStockQuantity(where);
  }

  async cacheStockQuantity(where: Prisma.StockWhereUniqueInput) {
    const quantity = await this.prisma.stockEvent.aggregate({
      _sum: {
        change: true,
      },
      where: {
        stockId: where.id,
        status: 'NORMAL',
      },
    });
    const quantityAvailable = await this.prisma.stockEvent.aggregate({
      _sum: {
        change: true,
      },
      where: {
        stockId: where.id,
        OR: [
          {
            status: 'NORMAL',
          },
          {
            status: 'PENDING',
          },
        ],
      },
    });
    return await this.prisma.stock.update({
      data: {
        cachedQuantity: quantity._sum.change,
        cachedQuantityAvailable: quantityAvailable._sum.change,
      },
      where,
    });
  }
  // #endregion

  // #region Arrival stock

  async getArrivalStockList(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StockEventWhereInput;
    orderBy?: Prisma.StockEventOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const data = await this.prisma.stockEvent.findMany({
      select: Selector.STOCK_EVENT,
      skip,
      take,
      where,
      orderBy,
    });

    return data;
  }

  async getArrivalStockCount(params: { where?: Prisma.StockEventWhereInput }) {
    const { where } = params;
    return await this.prisma.stockEvent.count({
      where,
    });
  }

  async arriveStock(params: { stockEventId: number; warehouseId: number }) {
    const stockEvent = await this.prisma.stockEvent.update({
      data: {
        status: 'NORMAL',
        stock: {
          update: {
            warehouse: {
              connect: {
                id: params.warehouseId,
              },
            },
          },
        },
      },
      where: {
        id: params.stockEventId,
      },
    });

    await this.cacheStockQuantity({
      id: stockEvent.stockId,
    });

    return stockEvent;
  }

  // #endregion

  // #region BusinessRelationship
  async getBusinessRelationship(
    where: Prisma.BusinessRelationshipWhereUniqueInput,
  ) {
    return await this.prisma.businessRelationship.findUnique({
      where,
      select: {
        dstCompany: true,
        srcCompany: true,
      },
    });
  }

  async getBusinessRelationshipList(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BusinessRelationshipWhereInput;
    orderBy?: Prisma.BusinessRelationshipOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return await this.prisma.businessRelationship.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        dstCompany: true,
        srcCompany: true,
      },
    });
  }

  async getBusinessRelationshipCount(params: {
    where?: Prisma.BusinessRelationshipWhereInput;
  }) {
    const { where } = params;
    return await this.prisma.businessRelationship.count({
      where,
    });
  }

  async createBusinessRelationship(
    data: Prisma.BusinessRelationshipCreateInput,
  ) {
    return await this.prisma.businessRelationship.create({
      data,
      select: {
        srcCompany: true,
        dstCompany: true,
      },
    });
  }
  // #endregion
}
