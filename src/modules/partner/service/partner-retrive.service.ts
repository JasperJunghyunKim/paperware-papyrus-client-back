import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { PartnerResponseDto } from '../api/dto/partner.request';
import { from, lastValueFrom, map } from 'rxjs';

@Injectable()
export class PartnerRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getPartnerList(companyId: number): Promise<PartnerResponseDto[]> {
    return await lastValueFrom(from(
      this.prisma.partner.findMany({
        select: {
          id: true,
          partnerNickName: true,
        },
        where: {
          companyId
        }
      })
    ).pipe(
      map((partner) => {
        return partner.map((partner) => {
          return {
            partnerId: partner.id,
            partnerNickName: partner.partnerNickName,
          }
        })
      }
      ))
    );
  }
}
