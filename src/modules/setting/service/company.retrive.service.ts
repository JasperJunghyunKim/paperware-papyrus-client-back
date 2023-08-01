import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { Util } from 'src/common';
import { COMPANY } from 'src/common/selector';
import { PrismaService } from 'src/core';

@Injectable()
export class SettingCompanyRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async get(companyId: number): Promise<Model.Company> {
    const company = await this.prisma.company.findUnique({
      select: COMPANY,
      where: {
        id: companyId,
      },
    });
    return Util.serialize(company);
  }
}
