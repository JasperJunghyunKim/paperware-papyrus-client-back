import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { InhouseProcessCreateDto } from './dto/inhouse-process.request';
import { InhouseProcessChangeService } from '../service/inhouse-process-change.service';

@Controller('/inhouse/process')
export class InhouseProcessController {
  constructor(private readonly change: InhouseProcessChangeService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Request() req: AuthType, @Body() dto: InhouseProcessCreateDto) {
    await this.change.create({
      companyId: req.user.companyId,
      ...dto,
    });
  }
}
