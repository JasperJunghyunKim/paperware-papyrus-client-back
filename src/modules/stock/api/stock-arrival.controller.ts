import {
	Body,
	Controller,
	Get,
	NotImplementedException,
	Param,
	Post,
	Put,
	Query,
	Request,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { StockArrivalChangeService } from '../service/stock-arrival-change.service';
import { StockArrivalRetriveService } from '../service/stock-arrival-retrive.service';
import { StockArrivalApplyDto, StockArrivalDetailDto, StockArrivalListQueryDto, StockArrivalPriceUpdateDto } from './dto/stock-arrival.request';
import { StockArrivalDetail } from 'src/@shared/api';

@Controller('/stock-arrival')
export class StockArrivalController {
	constructor(
		private readonly change: StockArrivalChangeService,
		private readonly retrive: StockArrivalRetriveService,
	) { }

	// @Get()
	// @UseGuards(AuthGuard)
	// async getStockArrivalList(
	//     @Request() req: AuthType,
	//     @Query() query: StockArrivalListQueryDto,
	// ): Promise<Api.OrderStockArrivalListResponse> {
	//     const items = await this.retrive.getStockArrivalList({
	//         companyId: req.user.companyId,
	//         skip: query.skip,
	//         take: query.take,
	//     });

	//     const total = await this.retrive.getStockArrivalCount({
	//         companyId: req.user.companyId,
	//     });

	//     return { items, total };
	// }

	@Get('/detail')
	@UseGuards(AuthGuard)
	async getDetail(
		@Request() req: AuthType,
		@Query() dto: StockArrivalDetailDto,
	): Promise<StockArrivalDetail> {
		const item = await this.retrive.getDetail({ companyId: req.user.companyId, ...dto });
		return item;
	}

	@Post('/apply')
	@UseGuards(AuthGuard)
	async applyStockArrival(
		@Request() req: AuthType,
		@Body() dto: StockArrivalApplyDto,
	): Promise<any> {
		// TODO: 권한 체크
		await this.change.applyStockArrival({
			companyId: req.user.companyId,
			...dto,
		});
	}

	@Put('/price')
	@UseGuards(AuthGuard)
	async updateStockArrivalPrice(
		@Request() req: AuthType,
		@Body() dto: StockArrivalPriceUpdateDto,
	) {
		dto.validate();
		await this.change.updateStockArrivalPrice({
			companyId: req.user.companyId,
			...dto,
		});
	}
}
