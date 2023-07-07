import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { BusinessRelationshipCompact } from 'src/@shared/models';
import { Selector } from 'src/common';
import { PrismaService } from 'src/core';

@Injectable()
export class BusinessRelationshipRetriveService {
  constructor(private prisma: PrismaService) {}

  async getList(params: {
    skip: number;
    take: number;
    srcCompanyId?: number;
    dstCompanyId?: number;
  }) {
    return await this.prisma.businessRelationship.findMany({
      select: Selector.BUSINESS_RELATIONSHIP,
      where: {
        srcCompanyId: params.srcCompanyId,
        dstCompanyId: params.dstCompanyId,
        isActivated: true,
      },
      skip: params.skip,
      take: params.take,
    });
  }

  async getCount(params: {
    srcCompanyId?: number;
    dstCompanyId?: number;
  }): Promise<number> {
    return await this.prisma.businessRelationship.count({
      where: {
        srcCompanyId: params.srcCompanyId,
        dstCompanyId: params.dstCompanyId,
      },
    });
  }

  async getItem(params: { srcCompanyId: number; dstCompanyId: number }) {
    return await this.prisma.businessRelationship.findUnique({
      select: Selector.BUSINESS_RELATIONSHIP,
      where: {
        srcCompanyId_dstCompanyId: {
          srcCompanyId: params.srcCompanyId,
          dstCompanyId: params.dstCompanyId,
        },
      },
    });
  }

  async getCompactList(params: {
    skip: number;
    take: number;
    companyId: number;
  }) {
    const items: BusinessRelationshipCompact[] = await this.prisma.$queryRaw`
      SELECT c.*, SUM(a.flag) AS flag FROM (
        SELECT
          CASE
            WHEN srcCompanyId = ${params.companyId} THEN srcCompanyId
            ELSE dstCompanyId
          END AS c1,
          CASE
            WHEN srcCompanyId = ${params.companyId} THEN dstCompanyId
            ELSE srcCompanyId
          END AS c2,
          CASE
            WHEN isActivated = 0 THEN 0
            WHEN srcCompanyId = ${params.companyId} THEN 1
            WHEN dstCompanyId = ${params.companyId} THEN 2
            ELSE 0
          END AS flag
        FROM BusinessRelationship br
      ) a
      INNER JOIN Company c on c.id = a.c2
      LEFT JOIN Partner p ON p.companyRegistrationNumber = c.companyRegistrationNumber
      WHERE a.c1 = ${params.companyId} AND p.companyId = ${params.companyId}
      GROUP BY a.c2
      LIMIT ${params.take ?? 1 << 30} OFFSET ${params.skip}
      `;

    return items.map((p) => ({
      ...p,
      flag: Number(p.flag),
    }));
  }

  async getCompactCount(params: { companyId: number }) {
    const total: { total: number }[] = await this.prisma.$queryRaw`
      SELECT c.*, COUNT(DISTINCT a.c1, a.c2) AS total FROM (
        SELECT
          CASE
            WHEN srcCompanyId = ${params.companyId} THEN srcCompanyId
            ELSE dstCompanyId
          END AS c1,
          CASE
            WHEN srcCompanyId = ${params.companyId} THEN dstCompanyId
            ELSE srcCompanyId
          END AS c2,
          CASE
            WHEN isActivated = 0 THEN 0
            WHEN srcCompanyId = ${params.companyId} THEN 1
            WHEN dstCompanyId = ${params.companyId} THEN 2
            ELSE 0
          END AS flag
        FROM BusinessRelationship br
      ) a
      INNER JOIN Company c on c.id = a.c2
      LEFT JOIN Partner p ON p.companyRegistrationNumber = c.companyRegistrationNumber
      WHERE a.c1 = ${params.companyId} AND p.companyId = ${params.companyId}
      GROUP BY a.c2
      `;

    return Number(total.at(0)?.total ?? 0);
  }

  async getCompactItem(params: {
    companyId: number;
    targetCompanyId: number;
  }): Promise<BusinessRelationshipCompact> {
    const item: BusinessRelationshipCompact[] = await this.prisma.$queryRaw`
      SELECT c.*, SUM(a.flag) AS flag FROM (
        SELECT
          CASE
            WHEN srcCompanyId = ${params.companyId} THEN srcCompanyId
            ELSE dstCompanyId
          END AS c1,
          CASE
            WHEN srcCompanyId = ${params.companyId} THEN dstCompanyId
            ELSE srcCompanyId
          END AS c2,
          CASE
            WHEN isActivated = 0 THEN 0
            WHEN srcCompanyId = ${params.companyId} THEN 1
            WHEN dstCompanyId = ${params.companyId} THEN 2
            ELSE 0
          END AS flag
        FROM BusinessRelationship br
      ) a
      INNER JOIN Company c on c.id = a.c2
      LEFT JOIN Partner p ON p.companyRegistrationNumber = c.companyRegistrationNumber
      WHERE a.c1 = ${params.companyId} AND a.c2 = ${params.targetCompanyId} AND p.companyId = ${params.companyId}
      GROUP BY a.c2
      `;

    const partner = await this.prisma.partner.findUnique({
      include: {
        company: true,
        partnerTaxManager: {
          where: {
            isDeleted: false,
          },
        },
      },
      where: {
        companyId_companyRegistrationNumber: {
          companyId: params.companyId,
          companyRegistrationNumber: item.at(0).companyRegistrationNumber,
        },
      },
    });
    return {
      ...item.at(0),
      flag: Number(item.at(0)?.flag ?? 0),
      partner,
    };
  }

  async searchPartner(params: {
    companyId: number;
    companyRegistrationNumber: string;
  }): Promise<Model.CompanyPartner> {
    const targetCompany = await this.prisma.company.findFirst({
      select: Selector.COMPANY,
      where: {
        companyRegistrationNumber: params.companyRegistrationNumber,
      },
    });

    const exists = await this.prisma.businessRelationship.findMany({
      where: {
        OR: [
          {
            srcCompanyId: params.companyId,
            dstCompany: {
              companyRegistrationNumber: params.companyRegistrationNumber,
            },
          },
          {
            dstCompanyId: params.companyId,
            srcCompany: {
              companyRegistrationNumber: params.companyRegistrationNumber,
            },
          },
        ],
      },
      include: {
        srcCompany: true,
        dstCompany: true,
      },
    });
    if (
      exists.some((p) =>
        [p.dstCompany, p.srcCompany]
          .filter((q) => q.id !== params.companyId)
          .some((r) => !!r.managedById == !!targetCompany.managedById),
      )
    ) {
      throw new BadRequestException('이미 등록된 거래처입니다.');
    }

    const partner = await this.prisma.partner.findUnique({
      select: Selector.PARTNER,
      where: {
        companyId_companyRegistrationNumber: {
          companyId: params.companyId,
          companyRegistrationNumber: params.companyRegistrationNumber,
        },
      },
    });

    const company = await this.prisma.company.findFirst({
      select: Selector.COMPANY,
      where: {
        companyRegistrationNumber: params.companyRegistrationNumber,
        managedById: null,
      },
    });

    return {
      partner,
      company,
    };
  }
}
