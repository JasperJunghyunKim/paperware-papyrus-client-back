import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { ByOffsetChangeService } from '../service/by-offset-change.service';
import { ByOffsetRetriveService } from '../service/by-offset-retrive.service';
import { ByEtcResponse } from './dto/etc.response';
import {
  ByOffsetCreateRequestDto,
  ByOffsetUpdateRequestDto,
} from './dto/offset.request';
import { AccountedTypeDto } from './dto/accounted.request';
import { IdDto } from 'src/common/request';

@Controller('/accounted')
export class ByOffsetController {
  constructor(
    private readonly byOffsetRetriveService: ByOffsetRetriveService,
    private readonly byOffsetChangeService: ByOffsetChangeService,
  ) {}

  @Get('accountedType/:accountedType/accountedId/:accountedId/offset')
  @UseGuards(AuthGuard)
  async getByOffset(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<ByEtcResponse> {
    return await this.byOffsetRetriveService.getOffset(
      req.user.companyId,
      accountedType,
      accountedId,
    );
  }

  @Post('accountedType/:accountedType/offset')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createByOffset(
    @Request() req: AuthType,
    @Param() param: AccountedTypeDto,
    @Body() byOffsetCreateRequest: ByOffsetCreateRequestDto,
  ): Promise<void> {
    await this.byOffsetChangeService.createOffset(
      req.user.companyId,
      param.accountedType,
      byOffsetCreateRequest,
    );
  }

  @Patch('accountedType/:accountedType/accountedId/:id/offset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateByOffset(
    @Request() req: AuthType,
    @Param() idParam: IdDto,
    @Param() typeParam: AccountedTypeDto,
    @Body() byOffsetUpdateRequest: ByOffsetUpdateRequestDto,
  ): Promise<void> {
    await this.byOffsetChangeService.updateOffset(
      typeParam.accountedType,
      idParam.id,
      byOffsetUpdateRequest,
    );
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/offset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteByOffset(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.byOffsetChangeService.deleteOffset(accountedType, accountedId);
  }
}
