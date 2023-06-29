import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { PartnerRetriveService } from '../service/partner-retrive.service';
import { PartnerResponseDto } from './dto/partner.request';

@Controller('/partner')
export class PartnerController {
  constructor(private readonly partnerRetriveService: PartnerRetriveService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getPartnerList(
    @Request() req: AuthType,
  ): Promise<PartnerResponseDto[]> {
    return await this.partnerRetriveService.getPartnerList(req.user.companyId);
  }
}
