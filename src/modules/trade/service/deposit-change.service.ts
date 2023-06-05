import { Injectable, NotFoundException } from "@nestjs/common";
import { DepositType, PackagingType, Prisma } from "@prisma/client";
import { Model } from "src/@shared";
import { PrismaService } from "src/core";

@Injectable()
export class DepositChangeService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  /** 보관량 증감 */
  async createDeposit(params: {
    srcCompanyId: number;
    dstCompanyId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    memo: string;
  }) {
    const {

    } = params;
  }
}