import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { ByOffsetChangeService } from '../service/by-offset-change.service';
import { ByOffsetRetriveService } from '../service/by-offset-retrive.service';
import { ByEtcResponse } from './dto/etc.response';
import { ByOffsetCreateRequestDto, ByOffsetUpdateRequestDto } from './dto/offset.request';

@Controller('/accounted')
export class ByOffsetController {
  constructor(private readonly byOffsetRetriveService: ByOffsetRetriveService, private readonly byOffsetChangeService: ByOffsetChangeService) { }

  @Get('accountedType/:accountedType/accountedId/:accountedId/offset')
  @UseGuards(AuthGuard)
  async getByOffset(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<ByEtcResponse> {
    return await this.byOffsetRetriveService.getOffset(req.user.companyId, accountedType, accountedId);
  }

  @Post('accountedType/:accountedType/offset')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createByOffset(@Param('accountedType') accountedType: AccountedType, @Body() byOffsetCreateRequest: ByOffsetCreateRequestDto): Promise<void> {
    await this.byOffsetChangeService.createOffset(accountedType, byOffsetCreateRequest);
  }

  @Patch('accountedType/:accountedType/accountedId/:accountedId/offset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateByOffset(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
    @Body() byOffsetUpdateRequest: ByOffsetUpdateRequestDto,
  ): Promise<void> {
    await this.byOffsetChangeService.updateOffset(accountedType, accountedId, byOffsetUpdateRequest);
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/offset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteByOffset(@Param('accountedType') accountedType: AccountedType, @Param('accountedId') accountedId: number): Promise<void> {
    await this.byOffsetChangeService.deleteOffset(accountedType, accountedId);
  }
}
