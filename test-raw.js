
const { Client } = require('pg')
const dotenv = require('dotenv')
dotenv.config()

async function main() {
    const connectionString = process.env.DATABASE_URL
    console.log('Testing raw PG connection to:', connectionString.split('@')[1])
    
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 10000,
    })

    try {
        console.log('Attempting to connect...');
        await client.connect()
        console.log('Connected! Attempting query...');
        const res = await client.query('SELECT current_user')
        console.log('Success! Raw PG Query Result:', res.rows[0])
    } catch (e) {
        console.error('Raw PG Connection Error Details:', e);
    } finally {
        try {
            await client.end()
        } catch (err) {}
        console.log('Test finished.');
    }
}

main()
