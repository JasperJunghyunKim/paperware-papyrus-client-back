import { PrismaService } from "src/core";

export type PrismaTransaction = Omit<PrismaService, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">;