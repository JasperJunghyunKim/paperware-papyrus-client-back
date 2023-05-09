import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNumber, IsObject, IsOptional, IsPositive, IsString, Length, ValidateNested } from "class-validator";
import { CreateNormalSalesRequest, StockGroup } from "src/@shared/api";

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