import { Module } from '@nestjs/common';
import { InvoiceChangeService } from './service/invoice-change.service';
import { InvoiceRetriveService } from './service/invoice-retrive.service';
import { InvoiceController } from './api/invoice.controller';
import { ShippingChangeService } from './service/shipping-change.service';
import { ShippingRetriveService } from './service/shipping-retrive.service';
import { ShippingController } from './api/shipping.controller';

@Module({
  providers: [
    InvoiceChangeService,
    InvoiceRetriveService,
    ShippingChangeService,
    ShippingRetriveService,
  ],
  controllers: [InvoiceController, ShippingController],
})
export class ShippingModule {}
