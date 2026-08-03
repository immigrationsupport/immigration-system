import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
    const agency = await prisma.agency.findFirst({ where: { isInternal: true } });
    if (!agency) {
        console.error("No internal/historical agency found. Did you run backfill-agency.ts first?");
        process.exit(1);
    }

    await prisma.agency.update({
        where: { id: agency.id },
        data: { name: "ATLE Immigration" }
    });

    console.log(`Renamed agency ${agency.id} to "ATLE Immigration".`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });