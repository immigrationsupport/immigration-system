import 'dotenv/config';
import prisma from "./lib/prisma";

const APP_STEP_SEQUENCE = [
  "REGISTRATION",
  "CONTRACT_SIGNING",
  "FEE_PAYMENT",
  "DOCUMENT_COLLECTION",
  "DIPLOMA_EQUIVALENCE",
  "LANGUAGE_TEST_REGISTRATION",
  "LANGUAGE_TEST_RESULTS",
  "PROFILE_CREATION",
  "APPLICATION_SUBMISSION",
  "MEDICAL_EXAMINATION",
  "PASSPORT_SUBMISSION"
];

async function main() {
  console.log('Fixing legacy applications...');
  
  // Find all applications
  const apps = await prisma.application.findMany({
    include: { steps: true }
  });

  for (const app of apps) {
    // If it doesn't have 11 steps or contains old schema steps like "PR" or "WORK"
    // Wait, the new Prisma Client only allows new enum values, but in the DB it might be out of sync.
    // Let's just check if it has less than 11 steps.
    if (app.steps.length < 11) {
      console.log(`Fixing application ${app.id} which has ${app.steps.length} steps...`);
      
      // Delete existing steps
      await prisma.applicationStep.deleteMany({
        where: { applicationId: app.id }
      });

      // Create new 11 steps
      const newSteps = APP_STEP_SEQUENCE.map((stepType, index) => {
        const isStep1 = index === 0;
        return {
          applicationId: app.id,
          type: stepType as any,
          status: isStep1 ? "IN_PROGRESS" as const : "PENDING" as const,
          isLocked: isStep1 ? false : true,
          description: isStep1 ? "Initial registration in progress." : null
        };
      });

      await prisma.applicationStep.createMany({
        data: newSteps
      });
      console.log(`Application ${app.id} now has 11 steps.`);
    }
  }

  console.log('Fix complete.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
