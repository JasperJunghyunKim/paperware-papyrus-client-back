import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class SettingCompanyChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async update(params: {
    companyId: number;
    businessName: string;
    representative: string;
    phoneNo: string;
    faxNo: string;
    address: string;
    bizType: string;
    bizItem: string;
  }) {
    await this.prisma.company.update({
      where: {
        id: params.companyId,
      },
      data: {
        businessName: params.businessName,
        representative: params.representative,
        phoneNo: params.phoneNo,
        faxNo: params.faxNo,
        address: params.address,
        bizType: params.bizType,
        bizItem: params.bizItem,
      },
    });
  }
}
