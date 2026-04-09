const { Pool } = require('pg');
const connectionString = "postgresql://neondb_owner:npg_Vbpc8v4nWjgf@ep-broad-thunder-ag8g7dfm-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=60&pgbouncer=true";

async function main() {
  const pool = new Pool({ connectionString });
  try {
    const client = await pool.connect();
    const tables = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';");
    console.log("Tables in database:", JSON.stringify(tables.rows, null, 2));
    client.release();
  } catch (e) {
    console.error("Query Error:", e);
  } finally {
    await pool.end();
  }
}

main();
