import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const globalForPrisma = global as unknown as {
  prisma_v2: PrismaClient | undefined;
};

const createPrisma = () => {
    let connectionString = process.env.DATABASE_URL || "";
    // Clean URL for HTTP fetch to avoid any pooling arguments that break it
    connectionString = connectionString.replace(/['"]+/g, '');
    let cleanUrl = connectionString.split('?')[0];

    const adapter = new PrismaNeonHttp(cleanUrl, { fetchOptions: {} });
    return new PrismaClient({ 
        adapter,
        log: ["error", "warn"] 
    });
};

export const prisma = globalForPrisma.prisma_v2 || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma;

export default prisma;