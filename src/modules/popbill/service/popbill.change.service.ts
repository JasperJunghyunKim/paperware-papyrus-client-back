import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  OrderType,
  PackagingType,
  TaxInvoicePurposeType,
  TaxInvoiceStatus,
} from '@prisma/client';
import { TON_TO_GRAM } from 'src/common/const';
import { PrismaService } from 'src/core';
import { PopbillRetriveService } from './popbill.retrive.service';
import { SUCCESS } from '../code/popbill.code';
import { createPopbillTaxInvoice } from './popbill.service';

@Injectable()
export class PopbillChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly popbillRetriveService: PopbillRetriveService,
  ) {}
}
