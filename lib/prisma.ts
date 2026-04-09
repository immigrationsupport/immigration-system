import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

// Singleton Pool to prevent connection exhaustion
const pool = globalForPrisma.pool || new Pool({ 
    connectionString,
    connectionTimeoutMillis: 30000,
    max: 10, 
});

if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma || new PrismaClient({ 
    adapter, 
    log: ["error", "warn"] 
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;