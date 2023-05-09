import { Module } from '@nestjs/common';
import { StaticController } from './api/static.controller';
import { StaticService } from './service/static.retrive.service';

@Module({
  controllers: [StaticController],
  providers: [StaticService],
})
export class StaticModule {}
