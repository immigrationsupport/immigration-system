import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const apps = await prisma.application.findMany({
      include: {
        steps: {
          select: { status: true }
        }
      }
    });
    console.log("Found applications with steps:", JSON.stringify(apps, null, 2));
  } catch (e) {
    console.error("Prisma query failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
