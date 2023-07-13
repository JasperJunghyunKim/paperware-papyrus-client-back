import {
  ConflictException,
  Get,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { TaxInvoiceStatus } from '@prisma/client';
import { PrismaService } from 'src/core';

@Injectable()
export class PopbillChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async issueTaxInvoice(companyId: number, taxInvoiceId: number) {
    await this.prisma.$transaction(async (tx) => {
      const [taxInvoice]: {
        id: number;
        status: TaxInvoiceStatus;
        orderCount: number;
      }[] = await tx.$queryRaw`
        SELECT ti.id, ti.status, COUNT(CASE WHEN o.id IS NOT NULL THEN 1 END) AS orderCount
          FROM TaxInvoice  AS ti
     LEFT JOIN \`Order\`   AS o   ON o.taxInvoiceId = ti.id
         WHERE ti.id = ${taxInvoiceId}
           AND ti.companyId = ${companyId}

        GROUP BY ti.id
      `;
      console.log(taxInvoice);

      if (!taxInvoice)
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      if (taxInvoice.status !== 'PREPARING')
        throw new ConflictException(`발행을 할 수 없는 상태입니다.`);
      if (Number(taxInvoice.orderCount) === 0)
        throw new ConflictException(`매출이 등록되지 않은 세금계산서 입니다.`);

      throw new NotImplementedException();
    });
  }
}
