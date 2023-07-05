import { Injectable } from '@nestjs/common';
import { from, lastValueFrom, map } from 'rxjs';
import { PrismaService } from 'src/core';
import { PartnerResponseDto } from '../api/dto/partner.request';

@Injectable()
export class PartnerRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getPartnerList(companyId: number): Promise<PartnerResponseDto[]> {
    return await lastValueFrom(
      from(
        this.prisma.partner.findMany({
          select: {
            companyId: true,
            partnerNickName: true,
            companyRegistrationNumber: true,
            creditLimit: true,
            memo: true,
          },
          where: {
            companyId,
          },
        }),
      ).pipe(
        map((partner) => {
          return partner.map((partner) => {
            return {
              companyId: partner.companyId,
              companyRegistrationNumber: partner.companyRegistrationNumber,
              partnerNickName: partner.partnerNickName,
              creditLimit: partner.creditLimit,
              memo: partner.memo,
            };
          });
        }),
      ),
    );
  }
}
