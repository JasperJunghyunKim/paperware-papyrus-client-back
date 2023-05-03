import { Test, TestingModule } from '@nestjs/testing';
import { WssGateway } from './wss.gateway';

describe('WssGateway 테스트', () => {
  let gateway: WssGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WssGateway],
    }).compile();

    gateway = module.get<WssGateway>(WssGateway);
  });

  it('WssGateway 서비스 호출', () => {
    expect(gateway).toBeDefined();
  });

  describe('WssGateway 함수 호출', () => {
    it('handleMessage() -> ', () => {
      expect(gateway.handleMessage({}, { name: 'Test' })).toBe('Hello, Test!');
      expect(gateway.handleMessage({}, {})).toBe('Hello, World!');
    });
  });
});
