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
import { ByCashChangeService } from '../service/by-cash-change.service';
import { ByCashRetriveService } from '../service/by-cash-retrive.service';
import { CashResponse } from './dto/cash.response';
import {
  ByCashCreateRequestDto,
  ByCashUpdateRequestDto,
} from './dto/cash.request';
import { AccountedTypeDto } from './dto/accounted.request';
import { IdDto } from 'src/common/request';

@Controller('/accounted')
export class ByCashController {
  constructor(
    private readonly byCashRetriveService: ByCashRetriveService,
    private readonly byCashChangeService: ByCashChangeService,
  ) {}

  @Get('accountedType/:accountedType/accountedId/:accountedId/cash')
  @UseGuards(AuthGuard)
  async getByCash(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<CashResponse> {
    return await this.byCashRetriveService.getByCash(
      req.user.companyId,
      accountedType,
      accountedId,
    );
  }

  @Post('accountedType/:accountedType/cash')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createCash(
    @Request() req: AuthType,
    @Param() param: AccountedTypeDto,
    @Body() byCashCreateRequest: ByCashCreateRequestDto,
  ): Promise<void> {
    await this.byCashChangeService.createCash(
      req.user.companyId,
      param.accountedType,
      byCashCreateRequest,
    );
  }

  @Patch('accountedType/:accountedType/accountedId/:id/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateCash(
    @Request() req: AuthType,
    @Param() idParam: IdDto,
    @Param() typeParm: AccountedTypeDto,
    @Body() byCashUpdateRequest: ByCashUpdateRequestDto,
  ): Promise<void> {
    await this.byCashChangeService.updateCash(
      req.user.companyId,
      typeParm.accountedType,
      idParam.id,
      byCashUpdateRequest,
    );
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteCash(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.byCashChangeService.deleteCash(accountedType, accountedId);
  }
}
