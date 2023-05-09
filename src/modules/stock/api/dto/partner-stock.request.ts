import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Max, Min } from "class-validator";
import { PartnerStockGroupListQuery } from "src/@shared/api";

/** 거래처 재고그룹 목록 조회 */
export class GetPartnerStockGroupListDto implements PartnerStockGroupListQuery {

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly skip: number = 0;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(10)
    @Max(100)
    readonly take: number = 30;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly companyId?: number = null;
}