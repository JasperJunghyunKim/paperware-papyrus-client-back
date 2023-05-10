import { Type } from "class-transformer";
import { IsInt, IsPositive } from "class-validator";

export class OrderIdDto {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly orderId: number;
}