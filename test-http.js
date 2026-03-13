
const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
    let connectionString = process.env.DATABASE_URL;
    connectionString = connectionString.replace(/['"]+/g, '');
    let cleanUrl = connectionString.split('?')[0];

    // Neon HTTP connection
    const sql = neon(cleanUrl);
    
    try {
        console.log("Connecting via HTTPS fetch to Neon...");
        const users = await sql`SELECT current_user`;
        console.log("Success! Users found:", users);
    } catch (e) {
        console.error("HTTPS Connection Error:", e);
    }
}

main();
