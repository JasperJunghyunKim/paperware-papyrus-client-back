import { Injectable } from "@nestjs/common";
import { PriceUnit } from "src/@shared/models/enum";
import { PrismaService } from "src/core";

@Injectable()
export class OfficialPriceRetriveService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }


}