import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AccountRetriveService } from '../service/account.retrive.service';
import { AccountChangeService } from '../service/account.change.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountResponse } from 'src/@shared/api/setting/account.response';

@Controller('/setting/account')
export class AccountController {
  constructor(
    private readonly retrive: AccountRetriveService,
    private readonly change: AccountChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async get(@Request() req: AuthType): Promise<AccountResponse> {
    return await this.retrive.get(req.user.id);
  }
}
