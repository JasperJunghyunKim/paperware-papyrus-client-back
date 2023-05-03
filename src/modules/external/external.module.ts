import { Module } from '@nestjs/common';
import { ExternalService } from './external.service';
import { ExternalController } from './external.controller';
import { InternalService } from '../internal/internal.service';

@Module({
  providers: [ExternalService, InternalService],
  controllers: [ExternalController],
})
export class ExternalModule { }
