import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrisma = () => {
  if (process.env.NEXT_RUNTIME === "edge") {
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const { Pool } = require("@neondatabase/serverless");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  } else {
    // Node.js Runtime (API Routes, Server Actions)
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
};

const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;