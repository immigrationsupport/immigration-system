
const { PrismaClient } = require("@prisma/client");
const { PrismaNeonHttp } = require("@prisma/adapter-neon");
const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
    let connectionString = process.env.DATABASE_URL;
    connectionString = connectionString.replace(/['"]+/g, '');
    let cleanUrl = connectionString.split('?')[0];

    // Neon HTTP connection
    const adapter = new PrismaNeonHttp(cleanUrl, { fetchOptions: {} });
    const prisma = new PrismaClient({ adapter });
    
    try {
        console.log("Connecting via PrismaNeonHTTP to Neon...");
        const users = await prisma.user.findMany({ take: 1 });
        console.log("Success! Users found:", users.length);
    } catch (e) {
        console.error("HTTPS Connection Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
