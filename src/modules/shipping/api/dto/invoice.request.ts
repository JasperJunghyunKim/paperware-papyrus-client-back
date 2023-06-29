import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import {
  InvoiceDisconnectShippingRequest,
  InvoiceListQuery,
  UpdateInvoiceStatusRequest,
} from 'src/@shared/api/shipping/invoice.request';
import { ArrayDistinct } from 'src/validator/array-distinct';

export default class InvoiceListQueryDto implements InvoiceListQuery {
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

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly shippingId: number | null = undefined;
}

export class InvoiceDisconnectShippingRequestDto
  implements InvoiceDisconnectShippingRequest
{
  @IsInt({ each: true })
  @Type(() => Number)
  readonly invoiceIds: number[];
}

export class UpdateInvoiceStatusDto implements UpdateInvoiceStatusRequest {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayDistinct()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsPositive({ each: true })
  readonly invoiceIds: number[];
}
