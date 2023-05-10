import { Controller } from "@nestjs/common";
import { OfficialPriceChangeService } from "../service/official-price-change.service";
import { OfficialPriceRetriveService } from "../service/official-price-retrive.service";

@Controller('/official-price')
export class OfficialPriceController {
    constructor(
        private readonly officialPriceChangeService: OfficialPriceChangeService,
        private readonly officialPriceRetriveService: OfficialPriceRetriveService,
    ) { }


}