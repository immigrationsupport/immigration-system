import prisma from './lib/prisma';

async function main() {
  console.log('Fetching legacy applications...');
  
  // Find all applications where at least one procedure is locked, but the application status is not SUBMITTED, VALIDATED, APPROVED, or REJECTED.
  const appsToUpdate = await prisma.application.findMany({
    where: {
      status: {
        in: ['PENDING', 'IN_PROGRESS'] // Old applications stuck in these states but have locked procedures
      },
      procedures: {
        some: {
          isLocked: true
        }
      }
    }
  });

  console.log(`Found ${appsToUpdate.length} legacy applications to mark as SUBMITTED`);

  for (const app of appsToUpdate) {
    await prisma.application.update({
      where: { id: app.id },
      data: { status: 'SUBMITTED' }
    });
    console.log(`Updated legacy application ${app.id} to SUBMITTED lock status.`);
  }

  console.log('Migration complete.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
