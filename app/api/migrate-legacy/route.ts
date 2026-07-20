import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/migrate-legacy:
 *   get:
 *     summary: Migrate legacy applications
 *     description: Finds pending applications with locked procedures and updates their status to SUBMITTED.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Migration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 updatedCount:
 *                   type: number
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Migration failed
 */
export async function GET() {
    try {
        console.log("Fetching legacy applications...");
        
        const appsToUpdate = await prisma.$queryRaw<any[]>`
            SELECT DISTINCT a.id 
            FROM "Application" a
            JOIN "Procedure" p ON a.id = p."applicationId"
            WHERE a.status IN ('PENDING', 'IN_PROGRESS', 'IN_REVIEW')
              AND p."isLocked" = true
        `;

        console.log(`Found ${appsToUpdate.length} legacy applications to mark as SUBMITTED`);
        let updated = 0;

        for (const app of appsToUpdate) {
            await prisma.$executeRaw`
                UPDATE "Application" 
                SET "status" = 'SUBMITTED'::"ApplicationStatus"
                WHERE id = ${app.id}
            `;
            updated++;
            console.log(`Updated application ${app.id} to SUBMITTED`);
        }

        return NextResponse.json({ success: true, updatedCount: updated, applications: appsToUpdate.map(a => a.id) });
    } catch (error: any) {
        console.error("Migration error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
