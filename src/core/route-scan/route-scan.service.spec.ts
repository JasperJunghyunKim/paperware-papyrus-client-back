import { DiscoveryModule, MetadataScanner } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { RouteScanService } from './route-scan.service';

describe('routeScanService 테스트', () => {
  let routeScanService: RouteScanService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule, MetadataScanner],
      providers: [RouteScanService],
    }).compile();

    routeScanService = moduleRef.get<RouteScanService>(RouteScanService);
  });

  it('routeScanService 서비스 호출 ', () => {
    expect(routeScanService).toBeDefined();
  });
});
