import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNumber, IsObject, IsOptional, IsPositive, IsString, Length, Max, Min, ValidateNested } from "class-validator";
import { CreateNormalSalesRequest, SalesListQuery, StockGroup } from "src/@shared/api";

/** salesId param */
export class SalesIdDto {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly salesId: number;
}

/** 매출 목록 조회 */
export class GetSalesListDto implements SalesListQuery {
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
}

/** 정상매출 등록 */
export class StockGroupDto implements StockGroup {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly warehouseId: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly productId: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly packagingId: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly grammage: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly sizeX: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly sizeY: number = 0;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly paperColorGroupId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly paperColorId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly paperPatternId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly paperCertId: number = null;
}

export class CreateNormalSalesDto implements CreateNormalSalesRequest {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly dstCompanyId: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly locationId: number;

    @IsOptional()
    @IsString()
    @Length(0, 100)
    readonly memo: string = '';

    @IsDateString()
    readonly wantedDate: string;

    @IsObject()
    @ValidateNested()
    @Type(() => StockGroupDto)
    readonly stockGroup: StockGroupDto;

    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    readonly quantity: number;
}