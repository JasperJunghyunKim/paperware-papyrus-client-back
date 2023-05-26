import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { from, lastValueFrom, map } from 'rxjs';
import { SecurityItemResponseDto, SecurityListResponseDto } from '../api/dto/security.response';

@Injectable()
export class SecurityRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getSecurityList(companyId: number): Promise<SecurityListResponseDto> {
    return await lastValueFrom(from(
      this.prisma.security.findMany({
        select: {
          id: true,
          securityType: true,
          securitySerial: true,
          securityAmount: true,
          securityStatus: true,
          drawedStatus: true,
          drawedDate: true,
          drawedBank: true,
          drawedBankBranch: true,
          drawedRegion: true,
          drawer: true,
          maturedDate: true,
          payingBank: true,
          payingBankBranch: true,
          payer: true,
          memo: true,
        },
        where: {
          companyId,
          isDeleted: false,
        }
      })
    ).pipe(
      map((securityList) => {
        return {
          items: securityList.map((security) => {
            return {
              securityId: security.id,
              securityType: security.securityType,
              securitySerial: security.securitySerial,
              securityAmount: security.securityAmount,
              securityStatus: security.securityStatus,
              drawedStatus: security.drawedStatus,
              drawedDate: security.drawedDate?.toISOString(),
              drawedBank: security.drawedBank,
              drawedBankBranch: security.drawedBankBranch,
              drawedRegion: security.drawedRegion,
              drawer: security.drawer,
              maturedDate: security.maturedDate?.toISOString(),
              payingBank: security.payingBank,
              payingBankBranch: security.payingBankBranch,
              payer: security.payer,
              memo: security.memo,
            }
          }),
          total: securityList.length,
        }
      }
      ))
    );
  }

  async getSecurityItem(cardId: number): Promise<SecurityItemResponseDto> {
    return await lastValueFrom(from(
      this.prisma.security.findFirst({
        select: {
          id: true,
          securityType: true,
          securitySerial: true,
          securityAmount: true,
          securityStatus: true,
          drawedStatus: true,
          drawedDate: true,
          drawedBank: true,
          drawedBankBranch: true,
          drawedRegion: true,
          drawer: true,
          maturedDate: true,
          payingBank: true,
          payingBankBranch: true,
          payer: true,
          memo: true,
        },
        where: {
          id: cardId,
          isDeleted: false,
        }
      })
    ).pipe(
      map((security) => {
        return {
          securityId: security.id,
          securityType: security.securityType,
          securitySerial: security.securitySerial,
          securityAmount: security.securityAmount,
          securityStatus: security.securityStatus,
          drawedStatus: security.drawedStatus,
          drawedDate: security.drawedDate?.toISOString(),
          drawedBank: security.drawedBank,
          drawedBankBranch: security.drawedBankBranch,
          drawedRegion: security.drawedRegion,
          drawer: security.drawer,
          maturedDate: security.maturedDate?.toISOString(),
          payingBank: security.payingBank,
          payingBankBranch: security.payingBankBranch,
          payer: security.payer,
          memo: security.memo,
        }
      })
    )
    );
  }
}
