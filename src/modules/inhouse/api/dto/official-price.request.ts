import { Type } from "class-transformer";
import { IsEnum, IsInt, IsObject, IsOptional, IsPositive, Max, Min, ValidateNested } from "class-validator";
import { PriceUnits } from "src/@shared/api";
import { OfficialPriceCreateRequest, OfficialPriceListQuery } from "src/@shared/api/inhouse/official-price.request";
import { OfficialPrice } from "src/@shared/models";
import { PriceUnit } from "src/@shared/models/enum";

/** 고시가 목록 */
export class OfficialPriceListDto implements OfficialPriceListQuery {
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
    readonly take: number = undefined;
}

/** 고시가 등록 */
export class OfficialPriceDto implements OfficialPrice {
    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly officialPrice: number;

    @IsEnum(PriceUnits)
    readonly officialPriceUnit: PriceUnit;
}

export class CreateOfficialPriceDto implements OfficialPriceCreateRequest {
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly productId: number;

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
    readonly sizeY: number = 0;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly paperColorGroupId: number | null = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly paperColorId: number | null = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly paperPatternId: number | null = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @IsPositive()
    readonly paperCertId: number | null = null;

    @IsObject()
    @ValidateNested()
    @Type(() => OfficialPriceDto)
    readonly wholesalePrice: OfficialPriceDto;

    @IsObject()
    @ValidateNested()
    @Type(() => OfficialPriceDto)
    readonly retailPrice: OfficialPriceDto;
}