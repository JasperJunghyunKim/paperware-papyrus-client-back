import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PartnerListResponse } from 'src/@shared/api/inhouse/partner.Response';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { PartnerRetriveService } from '../service/partner-retrive.service';
import { PartnerListQueryDto } from './dto/partner.request';

@Controller('inhouse/partner')
export class PartnerController {
  constructor(private readonly partnerRetriveService: PartnerRetriveService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: PartnerListQueryDto,
  ): Promise<PartnerListResponse> {
    const items = await this.partnerRetriveService.getList({
      skip: query.skip,
      take: query.take,
      companyId: req.user.companyId,
    });

    const total = await this.partnerRetriveService.getCount({
      companyId: req.user.companyId,
    });

    return {
      items,
      total,
    };
  }
}
