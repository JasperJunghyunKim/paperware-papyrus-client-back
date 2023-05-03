import { INestApplication } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('healthController 테스트', () => {
  let app: INestApplication;
  let healthController: HealthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    }).compile();

    app = moduleRef.createNestApplication();
    healthController = moduleRef.get<HealthController>(HealthController);
    app.init();
  });

  it('healthController 서비스 호출 ', () => {
    expect(healthController).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('healthController 함수 호출', () => {
    it('check -> ', async () => {
      const result = {
        status: 'ok',
      };
      expect(await healthController.check()).toStrictEqual(result);
    });

    it('checkHeap() -> ', async () => {
      const result = {
        details: { 'memory heap': { status: 'up' } },
        error: {},
        info: { 'memory heap': { status: 'up' } },
        status: 'ok',
      };
      // object 비교는 toStrictEqual 사용
      expect(await healthController.checkHeap()).toStrictEqual(result);
    });

    // TODO check Rss test code 다시 작성 필요
    // it('checkRss() -> ', async () => {
    //   const result = {
    //     details: { 'memory RSS': { status: 'up' } },
    //     error: {},
    //     info: { 'memory RSS': { status: 'up' } },
    //     status: 'ok',
    //   };
    //   // object 비교는 toStrictEqual 사용
    //   expect(await healthController.checkRss()).toStrictEqual(result);
    // });
  });
});
