import { Module } from '@nestjs/common';
import { CardController } from './api/card.controller';
import { CardRetriveService } from './service/card-retrive.service';
import { CardChangeService } from './service/card-change.service';

@Module({
  controllers: [CardController],
  providers: [CardRetriveService, CardChangeService],
})
export class CardModule { }
