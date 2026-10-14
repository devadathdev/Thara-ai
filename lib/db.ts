import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { tharaPrisma?: PrismaClient };
export const db = globalForPrisma.tharaPrisma ?? new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn","error"] : ["error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.tharaPrisma = db;
