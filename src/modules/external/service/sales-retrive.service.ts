import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core";
import { Prisma } from "@prisma/client";

@Injectable()
export class SalesRetriveService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getSalesList(companyId: number, skip: number, take: number) {
        const where: Prisma.OrderWhereInput = {
            srcCompanyId: companyId,
        }

        const [saleses, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                include: {
                    orderStock: {
                        include: {
                            dstLocation: true,
                            plan: true,
                        }
                    },
                },
                where,
                skip,
                take,
            }),
            this.prisma.order.count({ where })
        ])

        return { saleses, total };
    }
}