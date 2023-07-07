import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { PartnerStockGroupListResponse } from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { GetPartnerStockGroupListDto } from './dto/partner-stock.request';
import { PartnerStockRetriveService } from '../service/paertner-stock.retrive.service';
import { Util } from 'src/common';

@Controller('/partner/stock')
export class PartnerStockController {
  constructor(
    private readonly partnerStockRetriveService: PartnerStockRetriveService,
  ) {}

  @Get('/group')
  @UseGuards(AuthGuard)
  async getStockGroupList(
    @Request() req: AuthType,
    @Query() dto: GetPartnerStockGroupListDto,
  ): Promise<PartnerStockGroupListResponse> {
    const result = await this.partnerStockRetriveService.getStockGroupList(
      req.user.companyId,
      dto.skip,
      dto.take,
      dto.companyId,
      Util.searchKeywordsToIntArray(dto.packagingIds),
      Util.searchKeywordsToIntArray(dto.paperTypeIds),
      Util.searchKeywordsToIntArray(dto.manufacturerIds),
      dto.minGrammage,
      dto.maxGrammage,
      dto.sizeX,
      dto.sizeY,
    );

    return result;
  }
}
