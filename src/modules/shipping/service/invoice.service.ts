import { Injectable } from '@nestjs/common';
import { PackagingType } from '@prisma/client';

@Injectable()
export class InvoiceService {
  private readonly GRAM_PER_TON = 1000000;
  private readonly SHEET_PER_REAM = 500;

  getInvoicesWeight(
    invoices: {
      grammage: number;
      sizeX: number;
      sizeY: number;
      quantity: number;
      packaging: {
        type: PackagingType;
        packA: number;
        packB: number;
      };
    }[],
  ): number {
    const weight = invoices.reduce((acc, cur) => {
      switch (cur.packaging.type) {
        case 'ROLL':
          return cur.quantity / this.GRAM_PER_TON;

        case 'SKID':
        case 'REAM':
          return (
            (cur.quantity * cur.grammage * cur.sizeX * cur.sizeY) /
            this.GRAM_PER_TON /
            this.GRAM_PER_TON
          );

        case 'BOX':
          return (
            (cur.quantity *
              cur.grammage *
              cur.sizeX *
              cur.sizeY *
              cur.packaging.packA *
              cur.packaging.packB) /
            this.GRAM_PER_TON /
            this.GRAM_PER_TON
          );
      }
    }, 0);

    return weight;
  }
}
