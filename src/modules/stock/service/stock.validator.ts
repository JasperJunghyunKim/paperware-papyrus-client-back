import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Packaging, PackagingType } from '@prisma/client';

@Injectable()
export class StockValidator {
  private readonly MAX_ROLL_QUANTITY = 100 * 1000000;
  private readonly MAX_SHEET_QUANTITY = 5000000;

  validateQuantity(packaging: Packaging, quantity: number) {
    if (!packaging || !quantity)
      throw new InternalServerErrorException(
        'packaging and quantity are required',
      );
    if (packaging.type === PackagingType.ROLL) {
      if (quantity > this.MAX_ROLL_QUANTITY)
        throw new BadRequestException(
          `ROLL 재고의 최대 등록 중량은 ${this.MAX_ROLL_QUANTITY} 입니다.`,
        );
    } else {
      if (!Number.isInteger(quantity))
        throw new BadRequestException(
          `SHEET 재고의 수량은 정수단위로 입력하셔야 합니다.`,
        );
      if (quantity > this.MAX_SHEET_QUANTITY)
        throw new BadRequestException(
          `SHEET 재고의 최대 등록 수량은 ${this.MAX_SHEET_QUANTITY} 입니다.`,
        );
    }
  }
}
