import { Body, Controller, Get, NotImplementedException, Post, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { SalesChangeService } from "../service/sales-change.service";
import { SalesRetriveService } from "../service/sales-retrive.service";
import { CreateNormalSalesDto, GetSalesListDto } from "./dto/sales.resquest";

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
    ) {
        const saleses = await this.salesRetriveService.getSalesList(req.user.companyId, dto.skip, dto.take);

        return saleses;
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
}