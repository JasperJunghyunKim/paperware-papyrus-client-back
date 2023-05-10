import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import { PaidEtcRequest } from './dto/etc.request';
import { PaidEtcResponse } from './dto/etc.response';
import { AccountedChangeService } from '../service/accounted-change.service';

@Controller('/collacted')
export class CollactedController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
    private readonly accountedChangeService: AccountedChangeService,
  ) { }

}
