import { Module } from '@nestjs/common';
import { InternalService } from './internal.service';
import { InternalController } from './internal.controller';
import { StaticService } from '../static/static.service';

@Module({
  providers: [InternalService, StaticService],
  controllers: [InternalController],
})
export class InternalModule { }
