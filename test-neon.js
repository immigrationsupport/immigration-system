
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { Pool, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");
const dotenv = require("dotenv");
dotenv.config();

neonConfig.webSocketConstructor = ws;

async function main() {
    let connectionString = process.env.DATABASE_URL;
    connectionString = connectionString.replace(/['"]+/g, '');
    
    // Clean up url for neon serverless module
    let cleanUrl = connectionString.split('?')[0];
    console.log("Clean URL:", cleanUrl.split('@')[1]);

    const pool = new Pool({ connectionString: cleanUrl });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log("Connecting securely to Neon via WS (Clean URL)...");
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
