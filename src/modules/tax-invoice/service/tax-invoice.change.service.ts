import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class TaxInvoiceChangeService {
  constructor(private priamsService: PrismaService) {}

  async createTaxInvoice(params: {
    companyId: number;
    companyRegistrationNumber: string;
    writeDate: string;
  }) {
    const data = await this.priamsService.taxInvoice.create({
      data: {
        companyId: params.companyId,
        companyRegistrationNumber: params.companyRegistrationNumber,
        writeDate: params.writeDate,
        invoicerMgtKey: ulid().substring(0, 24),
      },
      select: { id: true },
    });

    return data.id;
  }

  async updateTaxInvoice(params: {
    companyId: number;
    id: number;
    writeDate: string;
    dstEmail: string;
    srcEmail: string;
    srcEmail2: string;
    memo: string;
  }) {
    return await this.priamsService.$transaction(async (tx) => {
      const taxInvoice = await tx.taxInvoice.findUnique({
        where: {
          id: params.id,
        },
      });
      if (!taxInvoice || taxInvoice.companyId !== params.companyId) {
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      }
      if (taxInvoice.status !== 'PREPARING') {
        throw new ConflictException(`수정할 수 없는 상태의 세금계산서 입니다.`);
      }

      await tx.taxInvoice.update({
        where: { id: params.id },
        data: {
          writeDate: params.writeDate,
          dstEmail: params.dstEmail,
          srcEmail: params.srcEmail,
          srcEmail2: params.srcEmail2,
          memo: params.memo,
        },
        select: { id: true },
      });

      return params.id;
    });
  }

  async deleteTaxInvoice(params: { id: number }) {
    const data = await this.priamsService.taxInvoice.delete({
      where: { id: params.id },
      select: { id: true },
    });

    return data.id;
  }
}
