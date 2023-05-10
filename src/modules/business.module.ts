import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { InternalModule } from './internal/internal.module';
import { StaticModule } from './static/static.module';
import { ExternalModule } from './external/external.module';
import { ExampleModule } from './example/user.module';
import { InhouseModule } from './inhouse/inhouse.module';
import { StockModule } from './stock/stock.module';
import { WorkingModule } from './working/working.module';
import { PartnerModule } from './partner/partner.module';
import { AccountedModule } from './accounted/accounted.module';

@Module({
  imports: [
    AuthModule,
    MeModule,
    InternalModule,
    StaticModule,
    ExternalModule,
    ExampleModule,
    InhouseModule,
    StockModule,
    WorkingModule,
    PartnerModule,
    AccountedModule,
  ],
})
export class BusinessModule { }
