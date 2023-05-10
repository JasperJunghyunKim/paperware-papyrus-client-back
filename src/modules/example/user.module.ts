import { Module } from '@nestjs/common';
import { UserController } from './api/user.controller';
import { UserRetriveService } from './service/user-retrive.service';
import { UserChangeService } from './service/user-change.service';

@Module({
  controllers: [UserController],
  exports: [UserRetriveService, UserChangeService],
  providers: [UserRetriveService, UserChangeService],
})
export class ExampleModule {}
