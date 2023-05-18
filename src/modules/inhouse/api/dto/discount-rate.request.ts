import { PackagingType, PriceUnit } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsPositive, IsString, Length, Max, Min, ValidateNested } from "class-validator";
import { DiscountRateCreateRequest } from "src/@shared/api/inhouse/discount-rate.request";

/** 고시가 등록 */
export class DiscountRateDto {
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(100)
    readonly discountRate: number;

    @IsEnum(PriceUnit)
    readonly discountRateUnit: PriceUnit;
}

export class DiscountRateCreateDto implements DiscountRateCreateRequest {
    @IsString()
    @Length(10, 10)
    readonly companyRegistrationNumber: string;

    @IsOptional()
    @IsEnum(PackagingType)
    readonly packagingType: PackagingType = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly paperDomainId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly manufacturerId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly paperGroupId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly paperTypeId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly grammage: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly sizeX: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(0)
    readonly sizeY: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly paperColorGroupId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly paperColorId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly paperPatternId: number = null;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly paperCertId: number = null;

    @IsObject()
    @ValidateNested()
    @Type(() => DiscountRateDto)
    readonly basicDiscountRate: DiscountRateDto;

    @IsObject()
    @ValidateNested()
    @Type(() => DiscountRateDto)
    readonly specialDiscountRate: DiscountRateDto;
}