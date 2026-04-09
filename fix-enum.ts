import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete dependent records first (FK constraints)
        console.log('Deleting Documents linked to Procedures...');
        await client.query(`DELETE FROM "Document" WHERE "procedureId" IS NOT NULL`);
        console.log('Documents deleted.');

        console.log('Deleting Messages linked to Procedures...');
        await client.query(`DELETE FROM "Message" WHERE "procedureId" IS NOT NULL`).catch(() => console.log('No Message FK or already clean.'));

        // The ApplicationStep model is mapped to "Procedure" table in DB
        console.log('Deleting all rows from "Procedure" table...');
        await client.query(`DELETE FROM "Procedure"`);
        console.log('Rows deleted.');

        // Drop the old type column first (it has a constraint on the old enum)
        console.log('Dropping old "type" column...');
        await client.query(`ALTER TABLE "Procedure" DROP COLUMN IF EXISTS "type"`);
        console.log('Column dropped.');

        // Drop all variants of the old enum (db push creates a temp enum during migration)
        console.log('Dropping old enum types...');
        await client.query(`DROP TYPE IF EXISTS "ProcedureType" CASCADE`);
        await client.query(`DROP TYPE IF EXISTS "ProcedureType_new" CASCADE`);
        await client.query(`DROP TYPE IF EXISTS "ProcedureType_old" CASCADE`);
        console.log('Enums dropped.');

        // Recreate with correct new values
        console.log('Creating new ProcedureType enum...');
        await client.query(`
            CREATE TYPE "ProcedureType" AS ENUM (
                'REGISTRATION',
                'CONTRACT_SIGNING',
                'FEE_PAYMENT',
                'DOCUMENT_COLLECTION',
                'DIPLOMA_EQUIVALENCE',
                'LANGUAGE_TEST_REGISTRATION',
                'LANGUAGE_TEST_RESULTS',
                'PROFILE_CREATION',
                'APPLICATION_SUBMISSION',
                'MEDICAL_EXAMINATION',
                'PASSPORT_SUBMISSION'
            )
        `);
        console.log('New enum created.');

        // Re-add the column
        await client.query(`
            ALTER TABLE "Procedure" ADD COLUMN "type" "ProcedureType" NOT NULL DEFAULT 'REGISTRATION'
        `);
        console.log('Column re-added.');

        await client.query('COMMIT');
        console.log('\n✅ Done! Now run: npx prisma generate && npx prisma db push');
    } catch (e: any) {
        await client.query('ROLLBACK');
        console.error('Error:', e.message || e);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
