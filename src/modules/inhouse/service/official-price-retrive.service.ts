import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core";

@Injectable()
export class OfficialPriceRetriveService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }
}