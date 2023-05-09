import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { SalesListResponse } from "src/@shared/api/external/sales.response";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { SalesChangeService } from "../service/sales-change.service";
import { SalesRetriveService } from "../service/sales-retrive.service";
import { CreateNormalSalesDto, GetSalesListDto, SalesIdDto } from "./dto/sales.resquest";

@Controller('/sales')
export class SalesController {
    constructor(
        private readonly salesRetriveService: SalesRetriveService,
        private readonly salesChangeService: SalesChangeService,
    ) { }

    // 조회
    @Get()
    @UseGuards(AuthGuard)
    async getSalesList(
        @Request() req: AuthType,
        @Query() dto: GetSalesListDto,
    ): Promise<SalesListResponse> {
        const result = await this.salesRetriveService.getSalesList(req.user.companyId, dto.skip, dto.take);

        return {
            items: result.saleses.map(sales => ({
                id: sales.id,
                orderNo: sales.orderNo,
                srcCompany: sales.srcCompany,
                dstCompany: sales.dstCompany,
                status: null,
                memo: sales.memo,
                wantedDate: sales.wantedDate.toISOString(),
                stockAcceptedCompanyId: sales.stockAcceptedCompanyId,
                isStockRejected: sales.isStockRejected,
                orderStock: null,
            })),
            total: result.total,
        };
    }

    // 변경
    @Post('/normal')
    @UseGuards(AuthGuard)
    async createNormal(
        @Request() req: AuthType,
        @Body() dto: CreateNormalSalesDto,
    ) {
        await this.salesChangeService.createNormal(
            req.user.companyId,
            dto.dstCompanyId,
            dto.locationId,
            dto.memo,
            dto.wantedDate,
            dto.quantity,
            dto.stockGroup,
        );
    }

    @Post('/:salesId/request')
    @UseGuards(AuthGuard)
    async requestStockOffer(
        @Request() req: AuthType,
        @Param() dto: SalesIdDto,
    ) {
        await this.salesChangeService.requestStockOffer(req.user.companyId, dto.salesId);
    }

    @Post('/:salesId/accept')
    @UseGuards(AuthGuard)
    async acceptStockOffer(
        @Request() req: AuthType,
        @Param() dto: SalesIdDto,
    ) {
        await this.salesChangeService.acceptStockOffer(req.user.companyId, dto.salesId);
    }
}