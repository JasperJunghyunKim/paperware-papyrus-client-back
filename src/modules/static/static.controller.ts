import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { StaticService } from './static.service';
import { Prisma } from '@prisma/client';
import { Record, Util } from 'src/common';
import { AuthType } from '../auth/auth.type';
import { AuthGuard } from '../auth/auth.guard';

@Controller('static')
export class StaticController {
  constructor(private staticService: StaticService) { }

  @Get('data')
  async getAll() {
    const product = await this.staticService.getAllProduct();
    const paperColorGroup = await this.staticService.getAllPaperColorGroup();
    const paperColor = await this.staticService.getAllPaperColor();
    const paperPattern = await this.staticService.getAllPaperPattern();
    const paperCert = await this.staticService.getAllPaperCert();
    const packaging = await this.staticService.getAllPackaging();

    return {
      product,
      paperColorGroup,
      paperColor,
      paperPattern,
      paperCert,
      packaging,
    };
  }

  @UseGuards(AuthGuard)
  @Get('company')
  async getCompanyList(
    @Request() req: AuthType,
    @Query() query: { skip?: string; take?: string },
  ): Promise<Record.List<Record.Company>> {
    const { skip, take } = query;

    const where: Prisma.CompanyWhereInput = {
      managedBy: null,
      NOT: {
        id: req.user.companyId,
      },
    };

    const items = await this.staticService.getCompanyList({
      skip: Util.parseNumber(skip),
      take: Util.parseNumber(take),
      where,
      orderBy: {
        businessName: 'asc',
      },
    });

    const count = await this.staticService.getCompanyCount({
      where,
    });

    return {
      items,
      count,
    };
  }
}
