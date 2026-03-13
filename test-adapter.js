
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
    const connectionString = process.env.DATABASE_URL;
    console.log("Connecting to:", connectionString.split("@")[1]);
    
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const users = await prisma.user.findMany({ take: 1 });
        console.log("Success! Users found:", users.length);
    } catch (e) {
        console.error("Connection Error:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
