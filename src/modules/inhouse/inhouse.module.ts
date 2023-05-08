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
  ],
  controllers: [
    BusinessRelationshipController,
    BusinessRelationshipRequestRequestController,
    CompanyController,
    LocationController,
    VirtualCompanyController,
    WarehouseController,
  ],
  exports: [
    BusinessRelationshipRetriveService,
  ]
})
export class InhouseModule { }
