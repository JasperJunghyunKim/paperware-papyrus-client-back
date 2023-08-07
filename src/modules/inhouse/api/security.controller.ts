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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { SecurityChangeService } from '../service/security-change.service';
import { SecurityRetriveService } from '../service/security-retrive.service';
import {
  SecurityCreateRequestDto,
  SecurityListDto,
  SecurityUpdateRequestDto,
  SecurityUpdateStatusRequestDto,
} from './dto/security.request';
import {
  SecurityItemResponseDto,
  SecurityListResponseDto,
} from './dto/security.response';
import { SecurityItemResponse } from 'src/@shared/api';
import { IdDto } from 'src/common/request';

@Controller('/security')
export class SecurityController {
  constructor(
    private readonly securityRetriveService: SecurityRetriveService,
    private readonly securityCahngeService: SecurityChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getSecurityList(
    @Request() req: AuthType,
    @Query() dto: SecurityListDto,
  ): Promise<SecurityListResponseDto> {
    return await this.securityRetriveService.getSecurityList(
      req.user.companyId,
      dto.skip,
      dto.take,
    );
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async getSecurityItem(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<SecurityItemResponse> {
    return await this.securityRetriveService.getSecurityItem(
      req.user.companyId,
      param.id,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createSecurity(
    @Request() req: AuthType,
    @Body() dto: SecurityCreateRequestDto,
  ) {
    return await this.securityCahngeService.createSecurity({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteSecurity(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<void> {
    await this.securityCahngeService.deleteSecurity(
      req.user.companyId,
      param.id,
    );
  }
}
