import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MeService } from './me.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';

@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  @UseGuards(AuthGuard)
  @Get('')
  getMe(@Request() req) {
    return this.meService.getMe(req.user.id);
  }
}
