import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { InternalModule } from './internal/internal.module';
import { StaticModule } from './static/static.module';
import { ExampleModule } from './example/user.module';
import { InhouseModule } from './inhouse/inhouse.module';
import { StockModule } from './stock/stock.module';
import { WorkingModule } from './working/working.module';
import { TradeModule } from './trade/trade.module';

@Module({
  imports: [
    AuthModule,
    MeModule,
    InternalModule,
    StaticModule,
    ExampleModule,
    InhouseModule,
    StockModule,
    WorkingModule,
    TradeModule,
  ],
})
export class BusinessModule {}
