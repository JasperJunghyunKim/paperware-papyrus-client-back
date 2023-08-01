import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { SettingCompanyRetriveService } from '../service/company.retrive.service';
import { SettingCompanyChangeService } from '../service/company.change.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { SettingCompanyResponse } from 'src/@shared/api/setting/company.response';

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
}
