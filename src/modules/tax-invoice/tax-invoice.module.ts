import { Module } from '@nestjs/common';
import { TaxInvoiceController } from './api/tax-invoice.controller';
import { TaxInvoiceRetriveService } from './service/tax-invoice.retrive.service';
import { TaxInvoiceChangeService } from './service/tax-invoice.change.service';
import { PopbillModule } from '../popbill/popbill.module';

@Module({
  imports: [PopbillModule],
  controllers: [TaxInvoiceController],
  providers: [TaxInvoiceRetriveService, TaxInvoiceChangeService],
})
export class TaxInvoiceModule {}
