import { Body, Controller, Get, Post, Query, Request, UseGuards } from "@nestjs/common";
import { OfficialPriceListResponse } from "src/@shared/api/inhouse/official-price.response";
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
    ): Promise<OfficialPriceListResponse> {
        const { officialPrices, total } = await this.officialPriceRetriveService.getList(req.user.companyId, dto.skip, dto.take);

        return {
            items: officialPrices.map(op => {
                const wholesale = op.officialPriceMap.find(opm => opm.officialPriceMapType === 'WHOLESALE');
                const retail = op.officialPriceMap.find(opm => opm.officialPriceMapType === 'RETAIL');

                delete op.product.paperDomainId;
                delete op.product.paperGroupId;
                delete op.product.manufacturerId;
                delete op.product.paperTypeId;

                return {
                    id: op.id,
                    product: op.product,
                    grammage: op.grammage,
                    sizeX: op.sizeX,
                    sizeY: op.sizeY,
                    paperColorGroup: op.paperColorGroup,
                    paperColor: op.paperColor,
                    paperPattern: op.paperPattern,
                    paperCert: op.paperCert,
                    wholesalesPrice: {
                        officialPrice: wholesale.officialPrice,
                        officialPriceUnit: wholesale.officialPriceUnit,
                    },
                    retailPrice: {
                        officialPrice: retail.officialPrice,
                        officialPriceUnit: retail.officialPriceUnit,
                    },
                }
            }),
            total,
        }
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