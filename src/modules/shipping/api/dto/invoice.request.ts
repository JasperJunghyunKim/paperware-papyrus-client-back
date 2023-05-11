import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import {
  InvoiceDisconnectShippingRequest,
  InvoiceListQuery,
} from 'src/@shared/api/shipping/invoice.request';

export class InvoiceListQueryDto implements InvoiceListQuery {
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
  implements InvoiceDisconnectShippingRequest {
  @IsInt({ each: true })
  @Type(() => Number)
  readonly invoiceIds: number[];
}
