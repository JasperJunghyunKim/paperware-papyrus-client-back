import {
  Controller,
  Get,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import { PartnerResponseDto } from './dto/paid.request';

@Controller('/collacted')
export class CollactedController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getStockList(
    @Request() req: AuthType,
  ): Promise<PartnerResponseDto[]> {
    return null
    // return await this.accountedRetriveService.getPartnerList(req.user.companyId);
  }
}
