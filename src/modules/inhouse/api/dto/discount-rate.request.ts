import { DiscountRateType, DiscountRateUnit, PackagingType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsPositive, IsString, Length, Max, Min, ValidateNested } from "class-validator";
import { DiscountRateCreateRequest, DiscountRateDeleteQuery, DiscountRateDetailQuery, DiscountRateListQuery, DiscountRateMappingQuery, DiscountRatePartnerListQuery, DiscountRateUpdateRequest } from "src/@shared/api/inhouse/discount-rate.request";

export class DiscountRateConditionIdDto {
    @IsInt()
    @Type(() => Number)
    @Min(1)
    readonly discountRateConditionId: number;
}

/** 할인율 등록 */
export class DiscountRateDto {
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(100)
    readonly discountRate: number;

    @IsEnum(DiscountRateUnit)
    readonly discountRateUnit: DiscountRateUnit;
}

export class DiscountRateCreateDto implements DiscountRateCreateRequest {
    @IsEnum(DiscountRateType)
    readonly discountRateType: DiscountRateType;

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

/** 할인율 조회 */
export class DiscountRateListDto implements DiscountRateListQuery {
    @IsOptional()
    @IsString()
    @Length(10, 10)
    readonly companyRegistrationNumber: string = null;

    @IsEnum(DiscountRateType)
    discountRateType: DiscountRateType;

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

/** 할인율 상세 */
export class DiscountRateDetailDto implements DiscountRateDetailQuery {
    @IsEnum(DiscountRateType)
    readonly discountRateType: DiscountRateType;
}

/** 할인율 수정 */
export class DiscountRateUpdateDto implements DiscountRateUpdateRequest {
    @IsEnum(DiscountRateType)
    readonly discountRateType: DiscountRateType;

    @IsObject()
    @ValidateNested()
    @Type(() => DiscountRateDto)
    readonly basicDiscountRate: DiscountRateDto;

    @IsObject()
    @ValidateNested()
    @Type(() => DiscountRateDto)
    readonly specialDiscountRate: DiscountRateDto;
}

/** 할인율 삭제 */
export class DiscountRateDeleteDto implements DiscountRateDeleteQuery {
    @IsEnum(DiscountRateType)
    readonly discountRateType: DiscountRateType;
}

/** 할인율 매핑 */
export class DiscountRateMappingDto implements DiscountRateMappingQuery {
    @IsString()
    @Length(10, 10)
    readonly companyRegistrationNumber: string;

    @IsEnum(DiscountRateType)
    readonly discountRateType: DiscountRateType;

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
}