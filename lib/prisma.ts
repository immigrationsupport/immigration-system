import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Explicit initialization for Prisma 7 with pg adapter
const globalForPrisma = global as unknown as {
    prisma_final_v7: PrismaClient | undefined;
};

const createPrisma = () => {
    console.log("[PRISMA] Initializing with @prisma/adapter-pg...");

    const dbUrl = (process.env.DATABASE_URL || "").replace(/['"]+/g, '');
    if (!dbUrl) {
        console.error("[PRISMA] CRITICAL ERROR: DATABASE_URL is missing!");
    }

    const pool = new Pool({
        connectionString: dbUrl,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: ["error", "warn"]
    });
};

export const prisma = globalForPrisma.prisma_final_v7 || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_final_v7 = prisma;

export default prisma;