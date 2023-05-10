import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { StaticService } from '../service/static.retrive.service';
import { Prisma } from '@prisma/client';
import { Record, Util } from 'src/common';
import { AuthType } from '../../auth/auth.type';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('static')
export class StaticController {
  constructor(private staticService: StaticService) {}

  @Get('paper-metadata')
  async getPaperMetadata() {
    const paperDomains = await this.staticService.getAllPaperDomain();
    const manufacturers = await this.staticService.GetAllManufacturer();
    const paperGroups = await this.staticService.GetAllPaperGroup();
    const paperTypes = await this.staticService.getAllPaperType();
    const products = await this.staticService.getAllProduct();
    const paperColorGroups = await this.staticService.getAllPaperColorGroup();
    const paperColors = await this.staticService.getAllPaperColor();
    const paperPatterns = await this.staticService.getAllPaperPattern();
    const paperCerts = await this.staticService.getAllPaperCert();
    const packagings = await this.staticService.getAllPackaging();

    return {
      paperDomains,
      manufacturers,
      paperGroups,
      paperTypes,
      products,
      paperColorGroups,
      paperColors,
      paperPatterns,
      paperCerts,
      packagings,
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
