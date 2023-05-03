import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Record, Selector, Util } from 'src/common';
import { ulid } from 'ulid';
import { AuthGuard } from '../auth/auth.guard';
import { AuthType } from '../auth/auth.type';
import { InternalService } from '../internal/internal.service';
import { ExternalService } from './external.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Controller('external')
export class ExternalController {
  constructor(
    private externalService: ExternalService,
    private internalService: InternalService,
    private prisma: PrismaService,
  ) { }

  // #region BusinessRelationshipRequest

  @UseGuards(AuthGuard)
  @Get('business-relationship/request')
  async getBusinessRelationshipRequestList(
    @Request() req: AuthType,
    @Query()
    query: {
      skip?: string;
      take?: string;
    },
  ): Promise<Record.List<Record.BusinessRelationshipRequest>> {
    const { skip, take } = query;
    const items = await this.externalService.getBusinessRelationshipRequestList(
      {
        skip: Util.parseNumber(skip),
        take: Util.parseNumber(take),
        where: {
          dstCompanyId: req.user.companyId,
          status: 'PENDING',
        },
      },
    );

    const count =
      await this.externalService.getBusinessRelationshipRequestCount({
        where: {
          dstCompanyId: req.user.companyId,
        },
      });

    return {
      items,
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('business-relationship/request/stats')
  async getBusinessRelationshipRequestStats(
    @Request() req: AuthType,
  ): Promise<Record.BusinessRelationshipRequestStats> {
    const pendingCount =
      await this.externalService.getBusinessRelationshipRequestCount({
        where: {
          dstCompanyId: req.user.companyId,
          status: 'PENDING',
        },
      });

    return {
      pendingCount,
    };
  }

  @UseGuards(AuthGuard)
  @Post('business-relationship/request/send')
  async createBusinessRelationshipRequest(
    @Request() req: AuthType,
    @Body()
    body: {
      dstCompanyId: number;
      memo?: string;
    },
  ): Promise<Record.BusinessRelationshipRequest> {
    return await this.externalService.upsertBusinessRelationshipRequest({
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
      status: 'PENDING',
      memo: body.memo ?? '',
    });
  }

  @UseGuards(AuthGuard)
  @Post('business-relationship/request/accept')
  async acceptBusinessRelationshipRequest(
    @Request() req: AuthType,
    @Body()
    body: {
      srcCompanyId: number;
    },
  ): Promise<void> {
    await this.externalService.updateBusinessRelationshipRequest({
      where: {
        srcCompanyId_dstCompanyId: {
          srcCompanyId: body.srcCompanyId,
          dstCompanyId: req.user.companyId,
        },
      },
      data: {
        status: 'ACCEPTED',
      },
    });

    await this.internalService.createBusinessRelationship({
      srcCompany: {
        connect: {
          id: req.user.companyId,
        },
      },
      dstCompany: {
        connect: {
          id: body.srcCompanyId,
        },
      },
    });
  }

  @UseGuards(AuthGuard)
  @Post('business-relationship/request/reject')
  async rejectBusinessRelationshipRequest(
    @Request() req: AuthType,
    @Body()
    body: {
      srcCompanyId: number;
    },
  ): Promise<void> {
    await this.externalService.updateBusinessRelationshipRequest({
      where: {
        srcCompanyId_dstCompanyId: {
          srcCompanyId: body.srcCompanyId,
          dstCompanyId: req.user.companyId,
        },
      },
      data: {
        status: 'REJECTED',
      },
    });
  }

  // #endregion

  // #region Vendor stock

  @UseGuards(AuthGuard)
  @Get('vendor-stock')
  async getVendorStockList(
    @Request() req: AuthType,
    @Query()
    query: {
      skip?: string;
      take?: string;
      companyId?: string;
    },
  ): Promise<Record.List<Record.VendorStock>> {
    const { skip, take } = query;
    const items = await this.externalService.getVendorStockList({
      dstCompanyId: req.user.companyId,
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where: {
        companyId: query.companyId ? Number(query.companyId) : undefined,
        cachedQuantity: {
          gt: 0,
        },
      },
    });

    const count = await this.externalService.getVendorStockCount({
      dstCompanyId: req.user.companyId,
      where: {
        companyId: query.companyId ? Number(query.companyId) : undefined,
      },
    });

    return {
      items,
      count,
    };
  }

  // #endregion

  // #region Stored stock

  @UseGuards(AuthGuard)
  @Get('stored-stock')
  async getStoredStockList(
    @Request() req: AuthType,
    @Query()
    query: {
      skip?: string;
      take?: string;
      companyId?: string;
    },
  ): Promise<Record.List<Record.VendorStock>> {
    const { skip, take } = query;
    const items = await this.externalService.getStoredStockList({
      warehouseCompanyId: req.user.companyId,
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where: {
        NOT: {
          companyId: req.user.companyId,
        },
      },
    });

    const count = await this.externalService.getStoredStockCount({
      warehouseCompanyId: req.user.companyId,
      where: {
        companyId: query.companyId ? Number(query.companyId) : undefined,
      },
    });

    return {
      items,
      count,
    };
  }

  // #endregion

  // #region Order

  @UseGuards(AuthGuard)
  @Get('order')
  async getOrderList(
    @Request() req: AuthType,
    @Query()
    query: {
      skip?: string;
      take?: string;
    },
  ): Promise<Record.List<Record.Order>> {
    const { skip, take } = query;
    const items = await this.externalService.getOrderList({
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where: {
        srcCompanyId: req.user.companyId,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const count = await this.externalService.getOrderCount({
      where: {
        srcCompanyId: req.user.companyId,
      },
    });

    return {
      items,
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('order/stats')
  async getOrderStats(@Request() req: AuthType): Promise<Record.OrderStats> {
    const preparingCount = await this.externalService.getOrderCount({
      where: {
        srcCompanyId: req.user.companyId,
        // status: 'PREPARING',
      },
    });

    return {
      preparingCount,
    };
  }

  @UseGuards(AuthGuard)
  @Get('order/:id')
  async getOrder(
    @Request() req: AuthType,
    @Param()
    param: {
      id: string;
    },
  ): Promise<Record.Order> {
    const { id } = param;
    const order = await this.prisma.order.findUnique({
      where: {
        id: Number(id),
      },
      select: Selector.ORDER,
    });

    const allowed =
      order.dstCompany.id === req.user.companyId &&
      (order.isEntrusted ||
        Util.inc(
          order.status,
          'ESTIMATE',
          'REQUESTED',
          'ACCEPTED',
          'REJECTED',
        ));

    if (order.srcCompany.id !== req.user.companyId && !allowed) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return null;
  }
  @UseGuards(AuthGuard)
  @Post('order')
  async createOrder(
    @Request() req: AuthType,
    @Body()
    body: {
      dstCompanyId: number;
      memo?: string;
      wantedDate?: string;
    },
  ): Promise<Record.Order> {
    return await this.externalService.createOrder({
      orderNo: ulid(),
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
      // status: 'PREPARING',
      memo: body.memo ?? '',
      wantedDate: body.wantedDate ?? null,
    });
  }

  @UseGuards(AuthGuard)
  @Post('order/sales')
  async createOrderSales(
    @Request() req: AuthType,
    @Body()
    body: {
      srcCompanyId: number;
      memo?: string;
      wantedDate?: string;
      items: {
        productId: number;
        quantity: number;
      }[];
    },
  ): Promise<Record.Order> {
    return await this.externalService.createOrder({
      orderNo: ulid(),
      dstCompany: {
        connect: {
          id: req.user.companyId,
        },
      },
      srcCompany: {
        connect: {
          id: body.srcCompanyId,
        },
      },
      // status: 'PREPARING',
      memo: body.memo ?? '',
      wantedDate: body.wantedDate ?? null,
      isEntrusted: true,
    });
  }

  @UseGuards(AuthGuard)
  @Put('order/:id')
  async updateOrder(
    @Request() req: AuthType,
    @Param() params: { id: string },
    @Body()
    body: {
      memo?: string;
      wantedDate?: string;
    },
  ): Promise<Record.Order> {
    const order = await this.externalService.getOrder({
      id: Number(params.id),
    });

    if (order.srcCompany.id !== req.user.companyId) {
      throw new HttpException(
        'You are not allowed to update this order',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.externalService.updateOrder({
      where: {
        id: Number(params.id),
      },
      data: {
        memo: body.memo ?? '',
        wantedDate: Util.iso8601ToDate(body.wantedDate) ?? undefined,
      },
    });
  }

  @UseGuards(AuthGuard)
  @Post('order/:id/request')
  async requestOrder(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<void> {
    const order = await this.externalService.getOrder({
      id: Util.parseNumber(param.id),
    });

    if (order.srcCompany.id !== req.user.companyId) {
      throw new HttpException(
        'You are not allowed to request this order',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!Util.inc(order.status, 'PREPARING', 'REJECTED')) {
      throw new HttpException(
        'You are not allowed to request this order',
        HttpStatus.FORBIDDEN,
      );
    }

    const isVirtual = order.dstCompany.managedById !== null;

    if (isVirtual) {
      await this.externalService.acceptOrder(order.id);
    } else {
      await this.externalService.updateOrder({
        where: {
          id: Util.parseNumber(param.id),
        },
        data: {
          // status: 'REQUESTED',
        },
      });
    }
  }

  @UseGuards(AuthGuard)
  @Post('order/:id/recover')
  async recoverOrder(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<Record.Order> {
    const order = await this.externalService.getOrder({
      id: Util.parseNumber(param.id),
    });

    if (order.srcCompany.id !== req.user.companyId) {
      throw new HttpException(
        'You are not allowed to recover this order',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!Util.inc(order.status, 'REJECTED')) {
      throw new HttpException(
        'You are not allowed to recover this order',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.externalService.updateOrder({
      where: {
        id: Util.parseNumber(param.id),
      },
      data: {
        // status: 'PREPARING',
      },
    });
  }

  @UseGuards(AuthGuard)
  @Post('order/:id/cancel')
  async cancelOrder(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<Record.Order> {
    const order = await this.externalService.getOrder({
      id: Util.parseNumber(param.id),
    });

    if (order.srcCompany.id !== req.user.companyId) {
      throw new HttpException(
        'You are not allowed to cancel this order',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!Util.inc(order.status, 'PREPARING', 'ESTIMATE', 'REJECTED')) {
      throw new HttpException(
        'You are not allowed to cancel this order',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.externalService.updateOrder({
      where: {
        id: Util.parseNumber(param.id),
      },
      data: {
        // status: 'CANCELLED',
      },
    });
  }

  @UseGuards(AuthGuard)
  @Post('order/:id/accept')
  async acceptOrder(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<void> {
    const order = await this.externalService.getOrder({
      id: Util.parseNumber(param.id),
    });

    if (order.dstCompany.id !== req.user.companyId) {
      throw new HttpException(
        'You are not allowed to accept this order',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!Util.inc(order.status, 'REQUESTED', 'PREPARING')) {
      throw new HttpException(
        'You are not allowed to accept this order',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.externalService.acceptOrder(Util.parseNumber(param.id));
  }

  @UseGuards(AuthGuard)
  @Post('order/:id/reject')
  async rejectOrder(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<Record.Order> {
    const order = await this.externalService.getOrder({
      id: Util.parseNumber(param.id),
    });

    if (order.dstCompany.id !== req.user.companyId) {
      throw new HttpException(
        'You are not allowed to reject this order',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!Util.inc(order.status, 'REQUESTED')) {
      throw new HttpException(
        'You are not allowed to reject this order',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.externalService.updateOrder({
      where: {
        id: Util.parseNumber(param.id),
      },
      data: {
        // status: 'REJECTED',
      },
    });
  }

  // #endregion

  // #region OrderStock

  @UseGuards(AuthGuard)
  @Get('order-stock')
  async getOrderStockList(
    @Request() req: AuthType,
    @Query()
    query: {
      orderId?: string;
      skip?: string;
      take?: string;
    },
  ): Promise<Record.List<Record.OrderStock>> {
    const order = await this.externalService.getOrder({
      id: Number(query.orderId),
    });

    const allowed =
      order.srcCompany.id === req.user.companyId ||
      ((['REQUESTED', 'ACCEPTED', 'REJECTED'].includes(order.status) ||
        order.isEntrusted) &&
        order.dstCompany.id === req.user.companyId);
    if (!allowed) {
      throw new HttpException(
        'You are not allowed to get this order stock list',
        HttpStatus.FORBIDDEN,
      );
    }

    const { skip, take } = query;
    const items = await this.externalService.getOrderStockList({
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where: {
        orderId: Number(query.orderId),
      },
    });

    const count = await this.externalService.getOrderStockCount({
      where: {
        orderId: Number(query.orderId),
      },
    });

    return null;
  }

  @UseGuards(AuthGuard)
  @Get('order-stock/:id')
  async getOrderStock(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<Record.OrderStock> {
    const data = await this.externalService.getOrderStock({
      id: Number(param.id),
    });

    const order = await this.externalService.getOrder({
      id: data.order.id,
    });

    const allowed =
      order.srcCompany.id === req.user.companyId ||
      (['REQUESTED', 'ACCEPTED', 'REJECTED'].includes(order.status) &&
        order.dstCompany.id === req.user.companyId);
    if (!allowed) {
      throw new HttpException(
        'You are not allowed to get this order stock',
        HttpStatus.FORBIDDEN,
      );
    }

    return null;
  }

  @UseGuards(AuthGuard)
  @Post('order-stock')
  async createOrderStock(
    @Request() req: AuthType,
    @Body()
    body: {
      orderId: number;
      productId: number;
      packagingId: number;
      grammage: number;
      sizeX: number;
      sizeY?: number | null;
      paperColorGroupId?: number | null;
      paperColorId?: number | null;
      paperPatternId?: number | null;
      paperCertId?: number[] | null;
      quantity?: number;
      memo?: string;
      dstLocationId?: number;
    },
  ): Promise<Record.OrderStock> {
    const order = await this.externalService.getOrder({
      id: body.orderId,
    });

    const allowed =
      order.srcCompany.id === req.user.companyId ||
      ((['REQUESTED', 'ACCEPTED', 'REJECTED'].includes(order.status) ||
        order.isEntrusted) &&
        order.dstCompany.id === req.user.companyId);
    if (!allowed) {
      throw new HttpException(
        'You are not allowed to create this order stock',
        HttpStatus.FORBIDDEN,
      );
    }

    const data = await this.externalService.createOrderStock({
      order: {
        connect: {
          id: body.orderId,
        },
      },
      dstLocation: body.dstLocationId
        ? {
          connect: {
            id: body.dstLocationId,
          },
        }
        : undefined,
    });

    return null;
  }

  // #endregion

  // #region Receiving order

  @UseGuards(AuthGuard)
  @Get('receiving-order')
  async getReceivingOrderList(
    @Request() req: AuthType,
    @Query()
    query: {
      skip?: string;
      take?: string;
    },
  ): Promise<Record.List<Record.Order>> {
    const { skip, take } = query;

    const where: Prisma.OrderWhereInput = {
      OR: [
        {
          dstCompanyId: req.user.companyId,
          status: {
            // in: ['REQUESTED', 'ACCEPTED', 'REJECTED'],
          },
        },
        {
          isEntrusted: true,
        },
      ],
    };

    const items = await this.externalService.getOrderList({
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where,
    });

    const count = await this.externalService.getOrderCount({
      where,
    });

    return {
      items: items.map((item) => ({
        ...item,
        wantedDate: Util.dateToIso8601(item.wantedDate),
      })),
      count,
    };
  }

  @UseGuards(AuthGuard)
  @Get('receiving-order/:id')
  async getReceivingOrder(
    @Request() req: AuthType,
    @Param() param: { id: string },
  ): Promise<Record.Order> {
    const data = await this.externalService.getOrder({
      id: Number(param.id),
    });

    const allowed =
      data.dstCompany.id === req.user.companyId &&
      ['REQUESTED', 'ACCEPTED', 'REJECTED'].includes(data.status);

    if (!allowed) {
      throw new HttpException(
        'You are not allowed to get this receiving order',
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      ...data,
      wantedDate: Util.dateToIso8601(data.wantedDate),
    };
  }

  // #endregion
}
