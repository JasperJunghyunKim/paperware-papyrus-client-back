import { Injectable } from '@nestjs/common';
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
            WHEN srcCompanyId = 1 THEN srcCompanyId
            ELSE dstCompanyId
          END AS c1,
          CASE
            WHEN srcCompanyId = 1 THEN dstCompanyId
            ELSE srcCompanyId
          END AS c2,
          CASE
            WHEN isActivated = FALSE THEN 0
            WHEN srcCompanyId = 1 THEN 1
            ELSE 2
          END AS flag
        FROM BusinessRelationship br
      ) a
      INNER JOIN Company c on c.id = a.c2
      INNER JOIN Partner p ON p.companyRegistrationNumber = c.companyRegistrationNumber
      WHERE c1 = ${params.companyId}
      GROUP BY a.c1, a.c2
      LIMIT ${params.take} OFFSET ${params.skip}
      `;

    return items;
  }

  async getCompactCount(params: { companyId: number }) {
    const total: number = await this.prisma.$queryRaw`
      SELECT COUNT(1) AS total FROM (
        SELECT
          CASE
            WHEN srcCompanyId = 1 THEN srcCompanyId
            ELSE dstCompanyId
          END AS c1,
          CASE
            WHEN srcCompanyId = 1 THEN dstCompanyId
            ELSE srcCompanyId
          END AS c2,
          CASE
            WHEN isActivated = FALSE THEN 0
            WHEN srcCompanyId = 1 THEN 1
            ELSE 2
          END AS flag
        FROM BusinessRelationship br
      ) a
      INNER JOIN Company c on c.id = a.c2
      INNER JOIN Partner p ON p.companyRegistrationNumber = c.companyRegistrationNumber
      WHERE c1 = ${params.companyId}
      GROUP BY a.c1, a.c2
      `;

    return total;
  }
}
