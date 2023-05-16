import { Record, Selector, Util } from 'src/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AuthType } from '../auth/auth.type';
import { InternalService } from './internal.service';
import { Prisma } from '@prisma/client';
import { ulid } from 'ulid';
import { StaticService } from '../static/service/static.retrive.service';
import { PrismaService } from 'src/core/database/prisma.service';

@Controller('internal')
export class InternalController {
  constructor(
    private internalService: InternalService,
    private staticService: StaticService,
    private prisma: PrismaService,
  ) { }

  // #region Warehouse
  @UseGuards(AuthGuard)
  @Get('warehouse')
  async getWarehouseList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Warehouse>> {
    const where = {
      companyId: req.user.companyId,
      isDeleted: false,
    };

    const items = await this.internalService.getWarehouseList({
      skip: Util.parseNumber(query.skip),
      take: Util.parseNumber(query.take),
      where,
      orderBy: {
        id: 'desc',
      },
    });
    const count = await this.internalService.getWarehouseCount({
      where,
    });

    return {
      items,
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('warehouse/stats')
  async getWarehouseStats(
    @Request() req: AuthType,
  ): Promise<Record.WarehouseStats> {
    const publicCount = await this.internalService.getWarehouseCount({
      where: {
        companyId: req.user.companyId,
        isPublic: true,
        isDeleted: false,
      },
    });
    const privateCount = await this.internalService.getWarehouseCount({
      where: {
        companyId: req.user.companyId,
        isPublic: false,
        isDeleted: false,
      },
    });
    return {
      publicCount,
      privateCount,
    };
  }

  @UseGuards(AuthGuard)
  @Get('warehouse/:id')
  async getWarehouse(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<Record.Warehouse> {
    const where = {
      id: Number(param.id),
    };

    const data = await this.internalService.getWarehouse(where);

    if (data.companyId !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return data;
  }

  @UseGuards(AuthGuard)
  @Post('warehouse')
  async createWarehouse(
    @Request() req: AuthType,
    @Body()
    body: {
      name: string;
      code: string | null;
      isPublic: boolean;
      address: string;
    },
  ): Promise<Record.Warehouse> {
    return await this.internalService.createWarehouse({
      name: body.name,
      code: body.code,
      isPublic: body.isPublic ?? false,
      address: body.address,
      company: {
        connect: {
          id: req.user.companyId,
        },
      },
    });
  }

  @UseGuards(AuthGuard)
  @Put('warehouse/:id')
  async updateWarehouse(
    @Request() req: AuthType,
    @Param() params: { id: string },
    @Body()
    body: {
      name: string;
      code: string | null;
      isPublic: boolean;
      address: string;
    },
  ): Promise<Record.Warehouse> {
    const where = {
      id: Number(params.id),
    };

    const warehouse = await this.internalService.getWarehouse(where);

    if (warehouse.companyId !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return await this.internalService.updateWarehouse({
      where,
      data: body,
    });
  }

  @UseGuards(AuthGuard)
  @Delete('warehouse/:id')
  async deleteWarehouse(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<Record.Warehouse> {
    const where = {
      id: Number(param.id),
    };

    const warehouse = await this.internalService.getWarehouse(where);

    if (warehouse.companyId !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return await this.internalService.updateWarehouse({
      where,
      data: {
        isDeleted: true,
      },
    });
  }
  // #endregion

  // #region Location
  @UseGuards(AuthGuard)
  @Get('location')
  async getLocationList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Location>> {
    const { skip, take } = query;

    const where = {
      companyId: req.user.companyId,
      isDeleted: false,
    };

    const items = await this.internalService.getLocationList({
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where,
      orderBy: {
        id: 'desc',
      },
    });
    const count = await this.internalService.getLocationCount({
      where,
    });

    return {
      items,
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('location/stats')
  async getLocationStats(
    @Request() req: AuthType,
  ): Promise<Record.LocationStats> {
    const publicCount = await this.internalService.getLocationCount({
      where: {
        companyId: req.user.companyId,
        isPublic: true,
        isDeleted: false,
      },
    });
    const privateCount = await this.internalService.getLocationCount({
      where: {
        companyId: req.user.companyId,
        isPublic: false,
        isDeleted: false,
      },
    });

    return {
      publicCount,
      privateCount,
    };
  }

  @UseGuards(AuthGuard)
  @Get('location/:id')
  async getLocation(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<Record.Location> {
    const where = {
      id: Number(param.id),
    };

    const data = await this.internalService.getLocation(where);

    if (data.companyId !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return data;
  }

  @UseGuards(AuthGuard)
  @Post('location')
  async createLocation(
    @Request() req: AuthType,
    @Body()
    body: {
      name: string;
      code: string | null;
      isPublic: boolean;
      address: string;
      warehouseId: number;
    },
  ): Promise<Record.Location> {
    return await this.internalService.createLocation({
      name: body.name,
      code: body.code,
      isPublic: body.isPublic ?? false,
      address: body.address,
      company: {
        connect: {
          id: req.user.companyId,
        },
      },
    });
  }

  @UseGuards(AuthGuard)
  @Put('location/:id')
  async updateLocation(
    @Request() req: AuthType,
    @Param() param: { id: string },
    @Body()
    body: {
      name: string;
      code: string | null;
      isPublic: boolean;
      address: string;
    },
  ): Promise<Record.Location> {
    const where = {
      id: Number(param.id),
    };

    const location = await this.internalService.getLocation(where);

    if (location.companyId !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return await this.internalService.updateLocation({
      where,
      data: body,
    });
  }
  // #endregion

  // #region Stock
  @UseGuards(AuthGuard)
  @Get('stock')
  async getStockList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Stock>> {
    const where: Prisma.StockWhereInput = {
      companyId: req.user.companyId,
      isDeleted: false,
      cachedQuantity: {
        gt: 0,
      },
    };

    const items = await this.prisma.stock.findMany({
      skip: Util.parseNumber(query.skip),
      take: Util.parseNumber(query.take),
      where,
      orderBy: {
        id: 'desc',
      },
      select: Selector.STOCK,
    });

    const count = await this.prisma.stock.count({
      where,
    });

    return null;
  }

  @UseGuards(AuthGuard)
  @Get('stock/stats')
  async getStockStats(@Request() req: AuthType): Promise<Record.StockStats> {
    const stockCount = await this.internalService.getStockCount({
      where: {
        companyId: req.user.companyId,
      },
    });

    const exstoreStockCount = await this.internalService.getStockCount({
      where: {
        AND: {
          companyId: req.user.companyId,
          NOT: [
            {
              warehouse: {
                companyId: req.user.companyId,
              },
            },
            {
              warehouse: null,
            },
          ],
        },
      },
    });

    return {
      stockCount,
      exstoreStockCount: exstoreStockCount,
    };
  }

  @UseGuards(AuthGuard)
  @Post('stock')
  async createStock(
    @Request() req: AuthType,
    @Body()
    body: {
      warehouseId: number | null;
      productId: number;
      packagingId: number;
      grammage: number;
      sizeX: number;
      sizeY?: number;
      paperColorGroupId?: number;
      paperColorId?: number;
      paperPatternId?: number;
      paperCertIds?: number[];
      price: number;
      quantity: number;
    },
  ): Promise<{ id: number }> {
    return await this.internalService.createStock(
      {
        serial: `${ulid()}`,
        company: {
          connect: {
            id: req.user.companyId,
          },
        },
        warehouse: body.warehouseId
          ? {
            connect: {
              id: body.warehouseId,
            },
          }
          : undefined,
        product: {
          connect: {
            id: body.productId,
          },
        },
        packaging: {
          connect: {
            id: body.packagingId,
          },
        },
        grammage: body.grammage,
        sizeX: body.sizeX,
        sizeY: body.sizeY ?? 0,
        paperColorGroup: body.paperColorGroupId
          ? {
            connect: {
              id: body.paperColorGroupId,
            },
          }
          : undefined,
        paperColor: body.paperColorId
          ? {
            connect: {
              id: body.paperColorId,
            },
          }
          : undefined,
        paperPattern: body.paperPatternId
          ? {
            connect: {
              id: body.paperPatternId,
            },
          }
          : undefined,
        paperCert: {
          // connect: body.paperCertIds?.map((id) => ({ id })) ?? [],
        },
      },
      body.quantity,
    );
  }

  // #endregion

  // #region Arrival stock

  @UseGuards(AuthGuard)
  @Get('arrival-stock')
  async getArrivalStockList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.StockEvent>> {
    const { skip, take } = query;

    const where: Prisma.StockEventWhereInput = {
      AND: [
        {
          status: 'PENDING',
          orderStockArrival: {
            some: {
              order: {
                srcCompanyId: req.user.companyId,
              },
            },
          },
        },
      ],
    };

    const items = await this.prisma.stockEvent.findMany({
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where,
      orderBy: {
        id: 'desc',
      },
      select: Selector.STOCK_EVENT,
    });
    const count = await this.prisma.stockEvent.count({
      where,
    });

    return null;
  }

  @UseGuards(AuthGuard)
  @Post('arrival-stock/apply')
  async applyArrivalStock(
    @Request() req: AuthType,
    @Body()
    body: {
      stockEventId: number;
      warehouseId: number;
    },
  ): Promise<void> {
    const where: Prisma.StockEventWhereUniqueInput = {
      id: body.stockEventId,
    };

    const arrivalStock = await this.prisma.stockEvent.findUnique({
      where,
      select: {
        id: true,
        stock: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!arrivalStock) {
      throw new NotFoundException('Not found');
    }

    if (arrivalStock.stock.companyId !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    this.internalService.arriveStock({
      stockEventId: arrivalStock.id,
      warehouseId: body.warehouseId,
    });
  }

  @UseGuards(AuthGuard)
  @Get('stock-output')
  async getStockOutputList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.StockEvent>> {
    const { skip, take } = query;

    const where: Prisma.StockEventWhereInput = {
      AND: [
        {
          status: 'PENDING',
          orderStockArrival: {
            some: {
              order: {
                dstCompanyId: req.user.companyId,
              },
            },
          },
        },
      ],
    };

    const items = await this.prisma.stockEvent.findMany({
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where,
      orderBy: {
        id: 'desc',
      },
      select: Selector.STOCK_EVENT,
    });
    const count = await this.prisma.stockEvent.count({
      where,
    });

    return null;
  }

  // #endregion

  // #region BusinessRelationship
  @UseGuards(AuthGuard)
  @Get('business-relationship/purchase')
  async getPurchaseBusinessRelationshipList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.BusinessRelationship>> {
    const { skip, take } = query;

    const where: Prisma.BusinessRelationshipWhereInput = {
      dstCompanyId: req.user.companyId,
    };

    const items = await this.internalService.getBusinessRelationshipList({
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where,
      orderBy: {
        dstCompany: {
          businessName: 'asc',
        },
      },
    });
    const count = await this.internalService.getBusinessRelationshipCount({
      where,
    });

    return {
      items,
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('business-relationship/purchase/stats')
  async getPurchaseBusinessRelationshipStats(
    @Request() req: AuthType,
  ): Promise<Record.BusinessRelationshipStats> {
    const count = await this.internalService.getBusinessRelationshipCount({
      where: {
        dstCompany: {
          id: req.user.companyId,
        },
        srcCompany: {
          managedById: null,
        },
      },
    });

    const virtualCount =
      await this.internalService.getBusinessRelationshipCount({
        where: {
          dstCompany: {
            id: req.user.companyId,
          },
          srcCompany: {
            managedById: {
              not: null,
            },
          },
        },
      });

    return {
      count,
      virtualCount,
    };
  }

  @UseGuards(AuthGuard)
  @Get('business-relationship/sales')
  async getSalesBusinessRelationshipList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.BusinessRelationship>> {
    const { skip, take } = query;

    const where: Prisma.BusinessRelationshipWhereInput = {
      srcCompanyId: req.user.companyId,
    };

    const items = await this.internalService.getBusinessRelationshipList({
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where,
      orderBy: {
        srcCompany: {
          businessName: 'asc',
        },
      },
    });
    const count = await this.internalService.getBusinessRelationshipCount({
      where,
    });

    return {
      items,
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('business-relationship/sales/stats')
  async getSalesBusinessRelationshipStats(
    @Request() req: AuthType,
  ): Promise<Record.BusinessRelationshipStats> {
    const count = await this.internalService.getBusinessRelationshipCount({
      where: {
        srcCompany: {
          id: req.user.companyId,
          companyRegistrationNumber: {
            not: null,
          },
        },
      },
    });

    const virtualCount =
      await this.internalService.getBusinessRelationshipCount({
        where: {
          srcCompany: {
            id: req.user.companyId,
            companyRegistrationNumber: null,
          },
        },
      });

    return {
      count,
      virtualCount,
    };
  }

  @UseGuards(AuthGuard)
  @Get('business-relationship/:srcCompanyId/:dstCompanyId')
  async getBusinessRelationship(
    @Request() req: AuthType,
    @Param() param: { srcCompanyId: string; dstCompanyId: string },
  ): Promise<Record.BusinessRelationship> {
    const where: Prisma.BusinessRelationshipWhereUniqueInput = {
      srcCompanyId_dstCompanyId: {
        srcCompanyId: Number(param.srcCompanyId),
        dstCompanyId: Number(param.dstCompanyId),
      },
    };

    const data = await this.internalService.getBusinessRelationship(where);

    if (
      data.srcCompany.id !== req.user.companyId &&
      data.dstCompany.id !== req.user.companyId
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    return data;
  }

  @UseGuards(AuthGuard)
  @Post('business-relationship')
  async createBusinessRelationship(
    @Request() req: AuthType,
    @Body()
    body: {
      dstCompanyId: number;
    },
  ): Promise<Record.BusinessRelationship> {
    return await this.internalService.createBusinessRelationship({
      srcCompany: {
        connect: {
          id: req.user.companyId,
        },
      },
      dstCompany: {
        connect: {
          id: body.dstCompanyId,
        },
      },
    });
  }

  @UseGuards(AuthGuard)
  @Post('business-relationship/virtual/purchase')
  async createVirtualPurchasesBusinessRelationship(
    @Request() req: AuthType,
    @Body()
    body: {
      srcCompanyId: number;
    },
  ): Promise<Record.BusinessRelationship> {
    const srcCompany = await this.staticService.getCompany({
      id: body.srcCompanyId,
    });

    if (srcCompany.managedById !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return await this.internalService.createBusinessRelationship({
      srcCompany: {
        connect: {
          id: body.srcCompanyId,
        },
      },
      dstCompany: {
        connect: {
          id: req.user.companyId,
        },
      },
    });
  }

  // #endregion

  // #region Virtual Company
  @UseGuards(AuthGuard)
  @Get('company/virtual')
  async getVirtualCompanyList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Company>> {
    const where: Prisma.CompanyWhereInput = {
      managedById: req.user.companyId,
    };

    const items = await this.staticService.getCompanyList({
      skip: Number(query.skip),
      take: Number(query.take),
      where,
      orderBy: {
        businessName: 'asc',
      },
    });
    const count = await this.staticService.getCompanyCount({
      where,
    });

    return {
      items,
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('company/virtual/stats')
  async getVirtualCompanyStats(
    @Request() req: AuthType,
  ): Promise<Record.VirtualCompanyStats> {
    const count = await this.staticService.getCompanyCount({
      where: {
        managedBy: {
          id: req.user.companyId,
          companyRegistrationNumber: {
            not: null,
          },
        },
      },
    });

    return {
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('company/virtual/:id')
  async getVirtualCompany(
    @Request() req: AuthType,
    @Param() param: { id: number },
  ): Promise<Record.Company> {
    const where: Prisma.CompanyWhereUniqueInput = {
      id: param.id,
    };

    const data = await this.staticService.getCompany(where);

    if (data.managedById !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return data;
  }

  // @UseGuards(AuthGuard)
  // @Post('company/virtual')
  // async createVirtualCompany(
  //   @Request() req: AuthType,
  //   @Body()
  //   body: {
  //     businessName: string;
  //     phoneNo: string;
  //     faxNo: string;
  //     email: string;
  //   },
  // ): Promise<Record.Company> {
  //   return await this.staticService.createCompany({
  //     businessName: body.businessName,
  //     managedBy: {
  //       connect: {
  //         id: req.user.companyId,
  //       },
  //     },
  //     phoneNo: body.phoneNo,
  //     faxNo: body.faxNo,
  //     email: body.email,
  //   });
  // }

  // #endregion

  // #region Plan

  @UseGuards(AuthGuard)
  @Get('plan/stats')
  async getPlanStats(@Request() req: AuthType): Promise<Record.PlanStats> {
    const count = await this.prisma.plan.count({
      where: {
        companyId: req.user.companyId,
      },
    });

    return {
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('plan')
  async getPlanList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Plan>> {
    const where: Prisma.PlanWhereInput = {
      companyId: req.user.companyId,
    };

    const items = await this.prisma.plan.findMany({
      skip: Util.parseNumber(query.skip),
      take: Util.parseNumber(query.take),
      where,
      orderBy: {
        id: 'desc',
      },
      select: Selector.PLAN,
    });

    const count = await this.prisma.plan.count({
      where,
    });

    return null;
  }

  @UseGuards(AuthGuard)
  @Get('plan/:id')
  async getPlan(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<Record.Plan> {
    const where: Prisma.PlanWhereUniqueInput = {
      id: Util.parseNumber(param.id),
    };

    const data = await this.prisma.plan.findUnique({
      where,
      select: Selector.PLAN,
    });

    if (data.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return null;
  }

  @UseGuards(AuthGuard)
  @Post('plan/:id/input')
  async createPlanInput(
    @Request() req: AuthType,
    @Param() param: { id: string },
    @Body()
    body: {
      serial: string;
      quantity: number;
    },
  ): Promise<void> {
    const where: Prisma.PlanWhereUniqueInput = {
      id: Util.parseNumber(param.id),
    };

    const plan = await this.prisma.plan.findUnique({
      where,
      select: Selector.PLAN,
    });

    const stock = await this.prisma.stock.findUnique({
      where: {
        serial: body.serial,
      },
    });

    if (
      plan.company.id !== req.user.companyId ||
      stock.companyId !== req.user.companyId
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prisma.$transaction(async (tx) => {
      tx.stockEvent.create({
        data: {
          stockId: stock.id,
          change: -body.quantity,
          status: 'PENDING',
          planIn: {
            connect: {
              id: plan.id,
            },
          },
        },
      });
    });
  }

  @UseGuards(AuthGuard)
  @Delete('plan/:id/input/:stockEventId')
  async deletePlanInput(
    @Request() req: AuthType,
    @Param() param: { id: string; stockEventId: string },
  ): Promise<void> {
    const where: Prisma.PlanWhereUniqueInput = {
      id: Util.parseNumber(param.id),
    };

    const plan = await this.prisma.plan.findUnique({
      where,
      select: Selector.PLAN,
    });

    const stockEvent = await this.prisma.stockEvent.findUnique({
      where: {
        id: Util.parseNumber(param.stockEventId),
      },
      include: {
        stock: true,
      },
    });

    if (
      plan.company.id !== req.user.companyId ||
      stockEvent.stock.companyId !== req.user.companyId
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prisma.$transaction(async (tx) => {
      tx.stockEvent.update({
        where: {
          id: stockEvent.id,
        },
        data: {
          status: 'CANCELLED',
        },
      });
    });
  }

  @UseGuards(AuthGuard)
  @Get('plan/:id/task')
  async getPlanTaskList(
    @Request() req: AuthType,
    @Param() param: { id: string },
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Task>> {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: Util.parseNumber(param.id),
      },
      select: {
        companyId: true,
      },
    });

    if (plan.companyId !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const where: Prisma.TaskWhereInput = {
      planId: Util.parseNumber(param.id),
      isDeleted: false,
    };

    const items = await this.prisma.task.findMany({
      skip: Util.parseNumber(query.skip),
      take: Util.parseNumber(query.take),
      where,
      orderBy: {
        id: 'desc',
      },
      select: Selector.TASK,
    });

    const count = await this.prisma.task.count({
      where,
    });

    return null;
  }

  @UseGuards(AuthGuard)
  @Put('plan/:id/next')
  async planNext(@Request() req: AuthType, @Param() param: { id: string }) {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: Util.parseNumber(param.id),
      },
      select: {
        company: true,
        // status: true,
      },
    });

    if (plan.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    // const nextStep: Record.PlanStatus =
    //   plan. === 'PREPARING'
    //     ? 'PROGRESSING'
    //     : plan.status === 'PROGRESSING'
    //       ? 'PROGRESSED'
    //       : 'RELEASED';

    await this.prisma.plan.update({
      where: {
        id: Util.parseNumber(param.id),
      },
      data: {
        // status: nextStep,
      },
    });
  }

  @UseGuards(AuthGuard)
  @Delete('task/:taskId')
  async deleteTask(
    @Request() req: AuthType,
    @Param() param: { taskId: string },
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: Util.parseNumber(param.taskId),
      },
      select: {
        plan: {
          select: {
            company: true,
          },
        },
      },
    });

    if (task.plan.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prisma.task.update({
      where: {
        id: Util.parseNumber(param.taskId),
      },
      data: {
        isDeleted: true,
      },
    });
  }

  @UseGuards(AuthGuard)
  @Post('task/converting')
  async createPlanTaskConverting(
    @Request() req: AuthType,
    @Body()
    body: {
      planId: number;
      sizeX: number;
      sizeY: number;
      memo?: string;
    },
  ): Promise<void> {
    const where: Prisma.PlanWhereUniqueInput = {
      id: body.planId,
    };

    const plan = await this.prisma.plan.findUnique({
      where,
      select: Selector.PLAN,
    });

    if (plan.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    // await this.prisma.$transaction(async (tx) => {
    //   await tx.task.create({
    //     data: {
    //       planId: plan.id,
    //       type: 'CONVERTING',
    //       taskNo: ulid(),
    //       taskConverting: {
    //         create: {
    //           sizeX: body.sizeX,
    //           sizeY: body.sizeY,
    //           memo: body.memo ?? '',
    //         },
    //       },
    //     },
    //   });
    // });
  }

  @UseGuards(AuthGuard)
  @Put('task/:taskId/converting')
  async updateTaskConverting(
    @Request() req: AuthType,
    @Param() param: { taskId: string },
    @Body()
    body: {
      sizeX: number;
      sizeY: number;
      memo?: string;
    },
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: Util.parseNumber(param.taskId),
      },
      select: {
        plan: {
          select: {
            company: true,
          },
        },
      },
    });

    if (task.plan.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prisma.taskConverting.update({
      where: {
        taskId: Util.parseNumber(param.taskId),
      },
      data: {
        sizeX: body.sizeX,
        sizeY: body.sizeY,
        memo: body.memo ?? '',
      },
    });
  }

  @UseGuards(AuthGuard)
  @Post('task/guillotine')
  async createPlanTaskGuillotine(
    @Request() req: AuthType,
    @Body()
    body: {
      planId: number;
      sizeX: number;
      sizeY: number;
      memo?: string;
    },
  ): Promise<void> {
    const where: Prisma.PlanWhereUniqueInput = {
      id: body.planId,
    };

    const plan = await this.prisma.plan.findUnique({
      where,
      select: Selector.PLAN,
    });

    if (plan.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    // await this.prisma.$transaction(async (tx) => {
    //   await tx.task.create({
    //     data: {
    //       planId: plan.id,
    //       type: 'GUILLOTINE',
    //       taskNo: ulid(),
    //       taskGuillotine: {
    //         create: {
    //           sizeX: body.sizeX,
    //           sizeY: body.sizeY,
    //           memo: body.memo ?? '',
    //         },
    //       },
    //     },
    //   });
    // });
  }

  @UseGuards(AuthGuard)
  @Put('task/:taskId/guillotine')
  async updateTaskGuillotine(
    @Request() req: AuthType,
    @Param() param: { taskId: string },
    @Body()
    body: {
      sizeX: number;
      sizeY: number;
      memo?: string;
    },
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: Util.parseNumber(param.taskId),
      },
      select: {
        plan: {
          select: {
            company: true,
          },
        },
      },
    });

    if (task.plan.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prisma.taskGuillotine.update({
      where: {
        taskId: Util.parseNumber(param.taskId),
      },
      data: {
        sizeX: body.sizeX,
        sizeY: body.sizeY,
        memo: body.memo ?? '',
      },
    });
  }

  // #endregion

  // #region Task

  @UseGuards(AuthGuard)
  @Get('task/stats')
  async getTaskStats(@Request() req: AuthType): Promise<Record.TaskStats> {
    const where: Prisma.TaskWhereInput = {
      plan: {
        companyId: req.user.companyId,
      },
    };

    const count = await this.prisma.task.count({
      where,
    });

    return {
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('task')
  async getTaskList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Task>> {
    const where: Prisma.TaskWhereInput = {
      plan: {
        companyId: req.user.companyId,
      },
    };

    const items = await this.prisma.task.findMany({
      skip: Util.parseNumber(query.skip),
      take: Util.parseNumber(query.take),
      where,
      orderBy: {
        id: 'desc',
      },
      select: Selector.TASK,
    });

    const count = await this.prisma.task.count({
      where,
    });

    return null;
  }

  @UseGuards(AuthGuard)
  @Get('task/:id')
  async getTaskDetail(
    @Request() req: AuthType,
    @Param() param: { id: number },
  ): Promise<Record.TaskDetail> {
    const where: Prisma.TaskWhereUniqueInput = {
      id: param.id,
    };

    const data = await this.prisma.task.findUnique({
      where,
      select: { ...Selector.TASK, plan: { select: Selector.PLAN } },
    });

    if (data.plan.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return null;
  }

  @UseGuards(AuthGuard)
  @Get('plan/:id/output')
  async getTaskOutputList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
    @Param() param: { id: string },
  ): Promise<Record.List<Record.StockEvent>> {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: Util.parseNumber(param.id),
      },
      select: {
        company: true,
      },
    });

    if (plan.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const where: Prisma.StockEventWhereInput = {
      planOut: {
        some: {
          id: Util.parseNumber(param.id),
        },
      },
    };

    const items = await this.prisma.stockEvent.findMany({
      skip: Util.parseNumber(query.skip),
      take: Util.parseNumber(query.take),
      where,
      orderBy: {
        id: 'desc',
      },
      select: Selector.STOCK_EVENT,
    });

    const count = await this.prisma.stockEvent.count({
      where,
    });

    return null;
  }

  @UseGuards(AuthGuard)
  @Post('plan/:id/output')
  async createTaskOutput(
    @Request() req: AuthType,
    @Param() param: { id: string },
    @Body()
    body: {
      productId: number;
      packagingId: number;
      grammage: number;
      sizeX: number;
      sizeY?: number;
      paperColorGroupId?: number;
      paperColorId?: number;
      paperPatternId?: number;
      paperCertIds?: number[];
      price: number;
      quantity: number;
    },
  ): Promise<void> {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: Util.parseNumber(param.id),
      },
      select: {
        company: true,
      },
    });

    if (plan.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prisma.$transaction(async (tx) => {
      const stock = await tx.stock.create({
        data: {
          serial: `${ulid()}`,
          company: {
            connect: {
              id: plan.company.id,
            },
          },
          product: {
            connect: {
              id: body.productId,
            },
          },
          packaging: {
            connect: {
              id: body.packagingId,
            },
          },
          grammage: body.grammage,
          sizeX: body.sizeX,
          sizeY: body.sizeY ?? 0,
          paperColorGroup: body.paperColorGroupId
            ? {
              connect: {
                id: body.paperColorGroupId,
              },
            }
            : undefined,
          paperColor: body.paperColorId
            ? {
              connect: {
                id: body.paperColorId,
              },
            }
            : undefined,
          paperPattern: body.paperPatternId
            ? {
              connect: {
                id: body.paperPatternId,
              },
            }
            : undefined,
          paperCert: {
            // connect: body.paperCertIds?.map((id) => ({ id })) ?? [],
          },
          // stockPrice: body.price,
        },
      });

      await tx.stockEvent.create({
        data: {
          status: 'PENDING',
          planOut: {
            connect: {
              id: Util.parseNumber(param.id),
            },
          },
          stockId: stock.id,
          change: body.quantity,
        },
      });
    });
  }

  // #endregion

  // #region Shipping

  @UseGuards(AuthGuard)
  @Get('shipping')
  async getShippingList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Shipping>> {
    const where: Prisma.ShippingWhereInput = {
      companyId: req.user.companyId,
    };

    const items = await this.prisma.shipping.findMany({
      skip: Util.parseNumber(query.skip),
      take: Util.parseNumber(query.take),
      where,
      orderBy: {
        id: 'desc',
      },
      select: Selector.SHIPPING,
    });

    const count = await this.prisma.shipping.count({
      where,
    });

    return {
      items,
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('shipping/:id')
  async getShippingDetail(
    @Request() req: AuthType,
    @Param() param: { id: number },
  ): Promise<Record.Shipping> {
    const where: Prisma.ShippingWhereUniqueInput = {
      id: param.id,
    };

    const data = await this.prisma.shipping.findUnique({
      where,
      select: Selector.SHIPPING,
    });

    if (data.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return data;
  }

  @UseGuards(AuthGuard)
  @Post('shipping')
  async createShipping(@Request() req: AuthType): Promise<void> {
    await this.prisma.shipping.create({
      data: {
        shippingNo: `${ulid()}`,
        company: {
          connect: {
            id: req.user.companyId,
          },
        },
      },
    });
  }

  @UseGuards(AuthGuard)
  @Delete('shipping/:id')
  async deleteShipping(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<void> {
    const where: Prisma.ShippingWhereUniqueInput = {
      id: Util.parseNumber(param.id),
    };

    const data = await this.prisma.shipping.findUnique({
      where,
      select: {
        company: true,
      },
    });

    if (data.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prisma.shipping.delete({
      where,
    });
  }

  // #endregion

  // #region Invoice

  @UseGuards(AuthGuard)
  @Get('invoice')
  async getInvoiceList(
    @Request() req: AuthType,

    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Invoice>> {
    const where: Prisma.InvoiceWhereInput = {
      shipping: {
        companyId: req.user.companyId,
      },
    };

    const items = await this.prisma.invoice.findMany({
      skip: Util.parseNumber(query.skip),
      take: Util.parseNumber(query.take),
      where,
      orderBy: {
        id: 'desc',
      },
      select: Selector.INVOICE,
    });

    const count = await this.prisma.invoice.count({
      where,
    });

    return null;
  }

  @UseGuards(AuthGuard)
  @Get('invoice/:id')
  async getInvoiceDetail(
    @Request() req: AuthType,
    @Param() param: { id: number },
  ): Promise<Record.Invoice> {
    const where: Prisma.InvoiceWhereUniqueInput = {
      id: param.id,
    };

    const data = await this.prisma.invoice.findUnique({
      where,
      select: Selector.INVOICE,
    });

    if (data.shipping.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return null;
  }

  @UseGuards(AuthGuard)
  @Post('invoice')
  async createInvoice(
    @Request() req: AuthType,
    @Body()
    body: {
      shippingId: number;
      stockEventId: number;
    },
  ): Promise<void> {
    const where: Prisma.ShippingWhereUniqueInput = {
      id: body.shippingId,
    };

    const shipping = await this.prisma.shipping.findUnique({
      where,
      select: {
        company: true,
      },
    });

    if (shipping.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    // await this.prisma.invoice.create({
    //   data: {
    //     invoiceNo: `${ulid()}`,
    //     shipping: {
    //       connect: {
    //         id: body.shippingId,
    //       },
    //     },
    //     stockEvent: {
    //       connect: {
    //         id: body.stockEventId,
    //       },
    //     },
    //   },
    // });
  }

  @UseGuards(AuthGuard)
  @Delete('invoice/:id')
  async deleteInvoice(
    @Request() req: AuthType,
    @Param() param: { id: number },
  ): Promise<void> {
    const where: Prisma.InvoiceWhereUniqueInput = {
      id: param.id,
    };

    const data = await this.prisma.invoice.findUnique({
      where,
      select: {
        shipping: {
          select: {
            company: true,
          },
        },
      },
    });

    if (data.shipping.company.id !== req.user.companyId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prisma.invoice.delete({
      where,
    });
  }

  // #endregion
}
