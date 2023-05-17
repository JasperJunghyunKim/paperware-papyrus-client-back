import { Module } from '@nestjs/common';
import { BusinessRelationshipController } from './api/business-relationship.controller';
import { LocationController } from './api/location.controller';
import { WarehouseController } from './api/warehouse.controller';
import { BusinessRelationshipRetriveService } from './service/business-relationship-retrive.service';
import { LocationChangeService } from './service/location-change.service';
import { LocationRetriveService } from './service/location-retrive.service';
import { WarehouseChangeService } from './service/warehouse-change.service';
import { WarehouseRetriveService } from './service/warehouse-retrive.service';
import { VirtualCompanyChangeService } from './service/virtual-company-change.service';
import { VirtualCompanyRetriveService } from './service/virtual-company-retrive.service';
import { BusinessRelationshipChangeService } from './service/business-relationship-change.service';
import { CompanyRetriveService } from './service/company-retrive.service';
import { BusinessRelationshipRequestRequestController } from './api/business-relationship-request.controller';
import { VirtualCompanyController } from './api/virtual-company.controller';
import { BusinessRelationshipRequestRetriveService } from './service/business-relationship-request-retrive.service';
import { BusinessRelationshipRequestChangeService } from './service/business-relationship-request-change.service';
import { CompanyController } from './api/company.controller';
import { OfficialPriceController } from './api/official-price.controller';
import { OfficialPriceChangeService } from './service/official-price-change.service';
import { OfficialPriceRetriveService } from './service/official-price-retrive.service';
import { BankAccountChangeService } from './service/bank-account-change.service';
import { BankAccountRetriveService } from './service/bank-account-retrive.service';
import { CardChangeService } from './service/card-change.service';
import { CardRetriveService } from './service/card-retrive.service';
import { CardController } from './api/card.controller';
import { BankAccountController } from './api/bank-account.controller';

@Module({
  providers: [
    BusinessRelationshipRetriveService,
    BusinessRelationshipChangeService,
    BusinessRelationshipRequestRetriveService,
    BusinessRelationshipRequestChangeService,
    CompanyRetriveService,
    LocationChangeService,
    LocationRetriveService,
    VirtualCompanyChangeService,
    VirtualCompanyRetriveService,
    WarehouseChangeService,
    WarehouseRetriveService,
    OfficialPriceChangeService,
    OfficialPriceRetriveService,
    BankAccountRetriveService,
    BankAccountChangeService,
    CardRetriveService,
    CardChangeService,
  ],
  controllers: [
    BusinessRelationshipController,
    BusinessRelationshipRequestRequestController,
    CompanyController,
    LocationController,
    VirtualCompanyController,
    WarehouseController,
    OfficialPriceController,
    CardController,
    BankAccountController,
  ],
  exports: [
    BusinessRelationshipRetriveService,
    LocationRetriveService,
    BankAccountRetriveService,
    CardRetriveService,
  ]
})
export class InhouseModule { }
