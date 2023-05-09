import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { PartnerStockRetriveService } from "../service/paertner-stock.retrive.service";
import { GetPartnerStockGroupListDto } from "./dto/partner-stock.request";

@Controller('/partner/stock')
export class PartnerStockController {
    constructor(
        private readonly partnerStockRetriveService: PartnerStockRetriveService,
    ) { }

    @Get('/group')
    @UseGuards(AuthGuard)
    async getStockGroupList(
        @Request() req: AuthType,
        @Query() dto: GetPartnerStockGroupListDto,
    ) {
        const result = await this.partnerStockRetriveService.getStockGroupList(
            req.user.companyId,
            dto.skip,
            dto.take,
            dto.companyId,
        );

        return result;
    }
}