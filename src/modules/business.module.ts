import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { StaticModule } from './static/static.module';
import { ExampleModule } from './example/user.module';
import { InhouseModule } from './inhouse/inhouse.module';
import { StockModule } from './stock/stock.module';
import { WorkingModule } from './working/working.module';
import { TradeModule } from './trade/trade.module';
import { ShippingModule } from './shipping/shipping.module';
import { PartnerModule } from './partner/partner.module';
import { AccountedModule } from './accounted/accounted.module';

@Module({
  imports: [
    AuthModule,
    MeModule,
    StaticModule,
    ExampleModule,
    InhouseModule,
    StockModule,
    WorkingModule,
    TradeModule,
    ShippingModule,
    PartnerModule,
    AccountedModule,
  ],
})
export class BusinessModule { }
