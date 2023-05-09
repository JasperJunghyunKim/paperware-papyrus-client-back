import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { from, lastValueFrom, map } from 'rxjs';

@Injectable()
export class AccountedChangeService {
  constructor(private readonly prisma: PrismaService) { }

  async getPartnerList(companyId: number): Promise<any[]> {
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
