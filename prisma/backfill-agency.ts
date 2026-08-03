/**
 * Phase 1 — backfill script.
 *
 * Run this ONCE, right after `npx prisma migrate dev --name add_agency_multi_tenant`
 * has been applied, and BEFORE agencyId is ever made required in a later migration.
 *
 *   npx tsx prisma/backfill-agency.ts
 *
 * What it does:
 *  1. Creates a single internal Agency ("agence historique") for all data that
 *     already exists in the database — never shown in the public plan list
 *     (see lib/plans.ts once Phase 3 introduces the Plan model).
 *  2. Assigns every existing User, Application and AuditLog to that agency.
 *  3. Leaves already-agency-scoped rows untouched (safe to re-run).
 */
import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
    console.log("Starting Phase 1 backfill...");

    // 1. Find or create the historical agency (idempotent — safe to re-run).
    let agency = await prisma.agency.findFirst({ where: { isInternal: true } });

    if (!agency) {
        agency = await prisma.agency.create({
            data: {
                name: "Agence historique (migration)",
                status: "ACTIVE",
                isInternal: true,
            },
        });
        console.log(`Created historical agency: ${agency.id}`);
    } else {
        console.log(`Historical agency already exists: ${agency.id}`);
    }

    // 2. Backfill every row that doesn't have an agency yet.
    const [users, applications, auditLogs] = await Promise.all([
        prisma.user.updateMany({
            where: { agencyId: null },
            data: { agencyId: agency.id },
        }),
        prisma.application.updateMany({
            where: { agencyId: null },
            data: { agencyId: agency.id },
        }),
        prisma.auditLog.updateMany({
            where: { agencyId: null },
            data: { agencyId: agency.id },
        }),
    ]);

    console.log(`Backfilled ${users.count} users, ${applications.count} applications, ${auditLogs.count} audit logs.`);
    console.log("Done. You can now safely run a follow-up migration to make agencyId required, once you've verified the counts above look right.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });