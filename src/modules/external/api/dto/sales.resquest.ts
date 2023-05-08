import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNumber, IsObject, IsOptional, IsPositive, IsString, Length, ValidateNested } from "class-validator";
import { CreateNormalSalesRequest, StockGroup } from "src/@shared/api";

/** 정상매출 등록 */
export class StockGroupDto implements StockGroup {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    warehouseId: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    productId: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    packagingId: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    grammage: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    sizeX: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    sizeY: number = 0;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    paperColorGroupId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    paperColorId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    paperPatternId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    paperCertId: number = null;
}

export class CreateNormalSalesDto implements CreateNormalSalesRequest {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    dstCompanyId: number;

    @IsInt()
    @Type(() => Number)
    @IsPositive()
    locationId: number;

    @IsOptional()
    @IsString()
    @Length(0, 100)
    memo: string = '';

    @IsDateString()
    wantedDate: string;

    @IsObject()
    @ValidateNested()
    @Type(() => StockGroupDto)
    stockGroup: StockGroupDto;

    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    quantity: number;
}