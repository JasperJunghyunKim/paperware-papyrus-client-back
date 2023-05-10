import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core";

@Injectable()
export class OfficialPriceChangeService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }
}