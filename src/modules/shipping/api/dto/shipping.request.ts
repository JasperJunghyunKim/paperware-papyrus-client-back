import { BadRequestException } from '@nestjs/common';
import { ShippingType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  ShippingCreateRequest,
  ShippingListQuery,
  ShippingUpdateRequest,
} from 'src/@shared/api/shipping/shipping.request';

export class ShippingListQueryDto implements ShippingListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly take: number = undefined;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  readonly invoiceStatus: string | null = null;
}

export class ShippingCreateRequestDto implements ShippingCreateRequest {
  @IsEnum(ShippingType)
  readonly type: ShippingType;

  @ValidateIf((obj) => obj.type === ShippingType.INHOUSE)
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly managerId: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly price: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly memo: string | null = null;

  validate() {
    switch (this.type) {
      case 'INHOUSE':
        if (this.companyRegistrationNumber !== null)
          throw new BadRequestException(
            `자사배송은 거래처를 선택할 수 없습니다.`,
          );
        break;
      case 'OUTSOURCE':
        if (this.managerId !== null)
          throw new BadRequestException(
            `외주배송은 배송담당자를 선택할 수 없습니다.`,
          );
        if (!this.memo)
          throw new BadRequestException(
            `외주배송은 배송메모를 필수로 입력하셔야 합니다.`,
          );
        break;
      case 'PARTNER_PICKUP':
        if (this.managerId !== null)
          throw new BadRequestException(
            `거래처 픽업은 배송담당자를 선택할 수 없습니다.`,
          );
        if (!this.memo)
          throw new BadRequestException(
            `거래처 픽업은 배송메모를 필수로 입력하셔야 합니다.`,
          );
        break;
    }
  }
}

export class ShippingConnectInvoicesRequestDto {
  @IsInt({ each: true })
  @Type(() => Number)
  readonly invoiceIds: number[];
}

/** 배송정보 수정 */
export class ShippingUpdateDto implements ShippingUpdateRequest {
  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(10, 10)
  readonly companyRegistrationNumber: string | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly price: number | null = null;

  @ValidateIf((obj, val) => val !== null)
  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly memo: string | null = null;
}
