import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { SettingCompanyRetriveService } from '../service/company.retrive.service';
import { SettingCompanyChangeService } from '../service/company.change.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { SettingCompanyResponse } from 'src/@shared/api/setting/company.response';
import { SettingCompanyUpdateDto } from './dto/company.request';

@Controller('/setting/company')
export class SettingCompanyController {
  constructor(
    private readonly retrive: SettingCompanyRetriveService,
    private readonly change: SettingCompanyChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async get(@Request() req: AuthType): Promise<SettingCompanyResponse> {
    return await this.retrive.get(req.user.companyId);
  }

  @Put()
  @UseGuards(AuthGuard)
  async update(
    @Request() req: AuthType,
    @Body() body: SettingCompanyUpdateDto,
  ): Promise<SettingCompanyResponse> {
    await this.change.update({
      companyId: req.user.companyId,
      ...body,
    });
    return await this.retrive.get(req.user.companyId);
  }
}
