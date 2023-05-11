import { Body, Controller, Get, Post, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { OfficialPriceChangeService } from "../service/official-price-change.service";
import { OfficialPriceRetriveService } from "../service/official-price-retrive.service";
import { CreateOfficialPriceDto, OfficialPriceListDto } from "./dto/official-price.request";

@Controller('/official-price')
export class OfficialPriceController {
    constructor(
        private readonly officialPriceChangeService: OfficialPriceChangeService,
        private readonly officialPriceRetriveService: OfficialPriceRetriveService,
    ) { }

    @Get()
    @UseGuards(AuthGuard)
    async getList(
        @Request() req: AuthType,
        @Query() dto: OfficialPriceListDto,
    ) {
        const { officialPrices, total } = await this.officialPriceRetriveService.getList(req.user.companyId, dto.skip, dto.take);

        return { officialPrices, total };
    }

    @Post()
    @UseGuards(AuthGuard)
    async create(
        @Request() req: AuthType,
        @Body() dto: CreateOfficialPriceDto,
    ) {
        await this.officialPriceChangeService.create(
            req.user.companyId,
            dto.productId,
            dto.grammage,
            dto.sizeX,
            dto.sizeY,
            dto.paperColorGroupId,
            dto.paperCertId,
            dto.paperPatternId,
            dto.paperCertId,
            dto.wholesalePrice,
            dto.retailPrice,
        );
    }
}