import { Selector } from 'src/common';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class StaticService {
  constructor(private prisma: PrismaService) {}

  // #region Paper Specs
  async getAllPaperDomain() {
    return await this.prisma.paperDomain.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async GetAllManufacturer() {
    return await this.prisma.manufacturer.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async GetAllPaperGroup() {
    return await this.prisma.paperGroup.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getAllPaperType() {
    return await this.prisma.paperType.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getAllProduct() {
    return await this.prisma.product.findMany({
      select: {
        id: true,
        paperDomain: true,
        manufacturer: true,
        paperGroup: true,
        paperType: true,
      },
    });
  }

  async getAllPaperColorGroup() {
    return await this.prisma.paperColorGroup.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getAllPaperColor() {
    return await this.prisma.paperColor.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getAllPaperPattern() {
    return await this.prisma.paperPattern.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getAllPaperCert() {
    return await this.prisma.paperCert.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getAllPackaging() {
    return await this.prisma.packaging.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        packA: true,
        packB: true,
      },
    });
  }

  // #endregion

  // #region Company
  async getCompany(where: Prisma.CompanyWhereUniqueInput) {
    return await this.prisma.company.findUnique({
      where,
      select: {
        id: true,
        businessName: true,
        companyRegistrationNumber: true,
        managedById: true,
        phoneNo: true,
        faxNo: true,
        representative: true,
      },
    });
  }

  async getCompanyList(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return await this.prisma.company.findMany({
      skip,
      take,
      where,
      orderBy,
      select: Selector.COMPANY,
    });
  }

  async getCompanyCount(params: { where?: Prisma.CompanyWhereInput }) {
    const { where } = params;
    return await this.prisma.company.count({
      where,
    });
  }

  async createCompany(data: Prisma.CompanyCreateInput) {
    return await this.prisma.company.create({
      data,
      select: Selector.COMPANY,
    });
  }

  // #endregion
}
