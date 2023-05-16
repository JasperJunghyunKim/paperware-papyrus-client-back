import { Module } from '@nestjs/common';
import { CardController } from './api/card.controller';
import { CardRetriveService } from './service/card-retrive.service';

@Module({
  controllers: [CardController],
  providers: [CardRetriveService],
})
export class CardModule { }
