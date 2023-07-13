import { Module } from '@nestjs/common';
import { PopbillChangeService } from './service/popbill.change.service';
import { PopbillRetriveService } from './service/popbill.retrive.service';

@Module({
  controllers: [],
  providers: [PopbillChangeService, PopbillRetriveService],
  exports: [PopbillChangeService, PopbillRetriveService],
})
export class PopbillModule {}
