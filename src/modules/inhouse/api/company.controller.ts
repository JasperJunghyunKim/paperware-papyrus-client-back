import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VirtualCompanyListResponse } from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { CompanyRetriveService } from '../service/company-retrive.service';
import { VirtualCompanyListQueryDto } from './dto/virtual-company.request';

@Controller('inhouse/company')
export class CompanyController {
  constructor(private readonly companyRetriveService: CompanyRetriveService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: VirtualCompanyListQueryDto,
  ): Promise<VirtualCompanyListResponse> {
    const items = await this.companyRetriveService.getList({
      skip: query.skip,
      take: query.take,
    });

    const total = await this.companyRetriveService.getCount();

    return {
      items,
      total,
    };
  }
}
