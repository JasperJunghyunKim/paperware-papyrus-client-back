import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import { DiscountRateListResponse, DiscountRateMappingResponse, DiscountRateResponse } from "src/@shared/api/inhouse/discount-rate.response";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { DiscountRateChangeService } from "../service/discount-rate.change.service";
import { DiscountRateRetriveService } from "../service/discount-rate.retrive.service";
import { DiscountRateConditionIdDto, DiscountRateCreateDto, DiscountRateDeleteDto, DiscountRateDetailDto, DiscountRateListDto, DiscountRateMappingDto, DiscountRateUpdateDto } from "./dto/discount-rate.request";

@Controller('/discount-rate')
export class DiscountRateController {
	constructor(
		private readonly change: DiscountRateChangeService,
		private readonly retrive: DiscountRateRetriveService,
	) { }

	@Get('/mapping')
	@UseGuards(AuthGuard)
	async getPurchaseDiscountRateMapping(
		@Request() req: AuthType,
		@Query() dto: DiscountRateMappingDto,
	): Promise<DiscountRateMappingResponse> {
		const result = await this.retrive.mapping(
			req.user.companyId,
			dto.companyRegistrationNumber,
			dto.discountRateType,
			dto.packagingType,
			dto.paperDomainId,
			dto.manufacturerId,
			dto.paperGroupId,
			dto.paperTypeId,
			dto.grammage,
			dto.sizeX,
			dto.sizeY,
			dto.paperColorGroupId,
			dto.paperColorId,
			dto.paperPatternId,
			dto.paperCertId,
		);

		return result;
	}

	@Post()
	@UseGuards(AuthGuard)
	async create(
		@Request() req: AuthType,
		@Body() dto: DiscountRateCreateDto,
	) {
		await this.change.createDiscountRate(
			req.user.companyId,
			dto.discountRateType,
			dto.companyRegistrationNumber,
			dto.packagingType,
			dto.paperDomainId,
			dto.manufacturerId,
			dto.paperGroupId,
			dto.paperTypeId,
			dto.grammage,
			dto.sizeX,
			dto.sizeY,
			dto.paperColorGroupId,
			dto.paperColorId,
			dto.paperPatternId,
			dto.paperCertId,
			dto.basicDiscountRate,
			dto.specialDiscountRate,
		);
	}

	@Get()
	@UseGuards(AuthGuard)
	async getList(
		@Request() req: AuthType,
		@Query() dto: DiscountRateListDto,
	): Promise<DiscountRateListResponse> {
		const result = await this.retrive.getList(
			req.user.companyId,
			dto.discountRateType,
			dto.companyRegistrationNumber,
			dto.skip,
			dto.take,
		);

		return result;
	}

	@Get('/:discountRateConditionId')
	@UseGuards(AuthGuard)
	async get(
		@Request() req: AuthType,
		@Param() param: DiscountRateConditionIdDto,
		@Query() dto: DiscountRateDetailDto,
	): Promise<DiscountRateResponse> {
		const item = await this.retrive.get(
			req.user.companyId,
			dto.discountRateType,
			param.discountRateConditionId,
		);

		return item;
	}

	@Put('/:discountRateConditionId')
	@UseGuards(AuthGuard)
	async update(
		@Request() req: AuthType,
		@Param() param: DiscountRateConditionIdDto,
		@Body() dto: DiscountRateUpdateDto,
	) {
		await this.change.updateDiscountRate(
			req.user.companyId,
			dto.discountRateType,
			param.discountRateConditionId,
			dto.basicDiscountRate,
			dto.specialDiscountRate,
		);
	}

	@Delete('/:discountRateConditionId')
	@UseGuards(AuthGuard)
	async deletePurchaseDiscountRate(
		@Request() req: AuthType,
		@Param() param: DiscountRateConditionIdDto,
		@Query() dto: DiscountRateDeleteDto,
	) {
		await this.change.deleteDiscountRate(
			req.user.companyId,
			dto.discountRateType,
			param.discountRateConditionId,
		);
	}
}