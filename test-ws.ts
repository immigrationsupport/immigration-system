
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';
import * as dotenv from 'dotenv';
dotenv.config();

neonConfig.webSocketConstructor = ws;

async function main() {
    const url = process.env.DATABASE_URL!.replace(/['"]+/g, '');
    const poolConfig = { connectionString: url };
    console.log("Pool config keys:", Object.keys(poolConfig));
    console.log("Has connectionString:", !!poolConfig.connectionString);
    console.log("Starts with postgresql:", poolConfig.connectionString.startsWith("postgresql://"));

    const pool = new Pool(poolConfig);
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const users = await prisma.user.findMany({ take: 1 });
        console.log("Success! Users:", users.length);
    } catch (err: any) {
        console.error("WS error:", err.message || err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
