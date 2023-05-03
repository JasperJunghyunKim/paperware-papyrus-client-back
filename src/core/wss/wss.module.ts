import { Module } from '@nestjs/common';

import { WssGateway } from './wss.gateway';

@Module({
  imports: [],
  providers: [WssGateway],
  exports: [WssGateway],
  controllers: [],
})
export class WssModule {}
