import { Module } from "@nestjs/common";
import { TempController } from "./temp.controller";
import { TempService } from "./temp.service";

/**
 * 해당 모듈은 거래금액 관련 임시모듈입니다
 * 거래모듈 작업후 이동 예정.
 */

@Module({
    controllers: [TempController],
    providers: [TempService],
})
export class TempModule { }