import { Test } from '@nestjs/testing';
import { winstonConfig } from '../config/winson';
import { PrismaLogger } from './prisma-logger.service';


const trueLoggerProvider = {
  provide: PrismaLogger,
  useFactory: () => new PrismaLogger(true),
};
const falseLoggerProvider = {
  provide: PrismaLogger,
  useFactory: () => new PrismaLogger(false),
};

describe('prismaLoggerService 테스트', () => {
  let prismaLoggerAndTrue: PrismaLogger;
  let prismaLoggerAndFalse: PrismaLogger;

  beforeEach(async () => {
    const moduleTrueRef = await Test.createTestingModule({
      providers: [trueLoggerProvider],
    }).compile();

    moduleTrueRef.useLogger(winstonConfig(process.env['NODE_ENV']));
    prismaLoggerAndTrue = moduleTrueRef.get<PrismaLogger>(PrismaLogger);

    const moduleFalseRef = await Test.createTestingModule({
      providers: [falseLoggerProvider],
    }).compile();

    moduleFalseRef.useLogger(winstonConfig(process.env['NODE_ENV']));
    prismaLoggerAndFalse = moduleFalseRef.get<PrismaLogger>(PrismaLogger);
  });

  it('prismaLoggerService 서비스 호출 ', () => {
    expect(prismaLoggerAndTrue).toBeDefined();
  });

  describe('prismaLoggerService 디버그 모드 함수 호출 - true', () => {
    it('query -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'query');
      prismaLoggerAndTrue.query({
        timestamp: new Date(),
        query: 'test',
        params: 'test',
        duration: 1,
        target: 'test',
      });

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(1);
    });

    it('info -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'info');

      prismaLoggerAndTrue.info({
        timestamp: new Date(),
        query: 'test',
        params: 'test',
        duration: 1,
        target: 'test',
      });

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(1);
    });

    it('warn -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'warn');

      prismaLoggerAndTrue.warn({
        timestamp: new Date(),
        query: 'test',
        params: 'test',
        duration: 1,
        target: 'test',
      });

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(1);
    });

    it('error -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'error');

      prismaLoggerAndTrue.error({
        timestamp: new Date(),
        query: 'test',
        params: 'test',
        duration: 1,
        target: 'test',
      } as any);

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(1);
    });

    it('setDebugMode -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'setDebugMode');
      prismaLoggerAndTrue.setDebugMode(true);
      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(1);
    });
  });

  describe('prismaLoggerService 디버그 모드 함수 호출 - false', () => {
    it('query -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'query');
      prismaLoggerAndFalse.query({
        timestamp: new Date(),
        query: 'test',
        params: 'test',
        duration: 1,
        target: 'test',
      });

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(2);
    });

    it('info -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'info');

      prismaLoggerAndFalse.info({
        timestamp: new Date(),
        query: 'test',
        params: 'test',
        duration: 1,
        target: 'test',
      });

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(2);
    });

    it('warn -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'warn');

      prismaLoggerAndFalse.warn({
        timestamp: new Date(),
        query: 'test',
        params: 'test',
        duration: 1,
        target: 'test',
      });

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(2);
    });

    it('error -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'error');

      prismaLoggerAndFalse.error({
        timestamp: new Date(),
        query: 'test',
        params: 'test',
        duration: 1,
        target: 'test',
      } as any);

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(2);
    });

    it('setDebugMode -> ', () => {
      const loggerSpy = jest.spyOn(PrismaLogger.prototype, 'setDebugMode');
      prismaLoggerAndFalse.setDebugMode(false);
      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toBeCalledTimes(2);
    });
  });
});
