import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import { PartnerStockGroupListResponse } from "src/@shared/api";
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
    ): Promise<PartnerStockGroupListResponse> {
        const { stockGroups, total } = await this.partnerStockRetriveService.getStockGroupList(
            req.user.companyId,
            dto.skip,
            dto.take,
            dto.companyId,
        );

        return {
            items: stockGroups.map((sg) => ({
                warehouse: sg.warehouseId
                    ? {
                        company: {
                            id: sg.partnerCompanyId,
                            businessName: sg.partnerCompanyBusinessName,
                            companyRegistrationNumber: sg.partnerCompanyRegistrationNumber,
                            invoiceCode: sg.partnerCompanyInvoiceCode,
                            representative: sg.partnerCompanyRepresentative,
                            address: sg.partnerCompanyAddress,
                            phoneNo: sg.partnerCompanyPhoneNo,
                            faxNo: sg.partnerCompanyFaxNo,
                            email: sg.partnerCompanyEmail,
                            managedById: sg.partnerCompanyManagedById,
                        },
                        id: sg.warehouseId,
                        name: sg.warehouseName,
                        code: sg.warehouseCode,
                        isPublic: sg.warehouseIsPublic,
                        address: sg.warehouseAddress,
                    }
                    : null,
                    orderStock: null, // TODO: 일단 null로 둠
                product: {
                    id: sg.productId,
                    paperDomain: {
                        id: sg.paperDomainId,
                        name: sg.paperDomainName,
                    },
                    paperGroup: {
                        id: sg.paperGroupId,
                        name: sg.paperGroupName,
                    },
                    manufacturer: {
                        id: sg.manufacturerId,
                        name: sg.manufacturerName,
                    },
                    paperType: {
                        id: sg.paperTypeId,
                        name: sg.paperTypeName,
                    },
                },
                packaging: {
                    id: sg.packagingId,
                    type: sg.packagingType,
                    packA: sg.packagingPackA,
                    packB: sg.packagingPackB,
                },
                grammage: sg.grammage,
                sizeX: sg.sizeX,
                sizeY: sg.sizeY,
                paperColorGroup: sg.paperColorGroupId
                    ? {
                        id: sg.paperColorGroupId,
                        name: sg.paperColorGroupName,
                    }
                    : null,
                paperColor: sg.paperColorId
                    ? {
                        id: sg.paperColorId,
                        name: sg.paperColorName,
                    }
                    : null,
                paperPattern: sg.paperPatternId
                    ? {
                        id: sg.paperPatternId,
                        name: sg.paperPatternName,
                    }
                    : null,
                paperCert: sg.paperCertId
                    ? {
                        id: sg.paperCertId,
                        name: sg.paperCertName,
                    }
                    : null,
                orderStock: null,
                totalQuantity: sg.totalQuantity,
                availableQuantity: sg.availableQuantity,
            })),
            total,
        };
    }
}
