import prisma from './lib/prisma';

async function main() {
    try {
        console.log("Testing DB connection...");
        const userCount = await prisma.user.count();
        console.log(`Connection successful. User count: ${userCount}`);
        
        const logs = await prisma.auditLog.findMany({ take: 5 });
        console.log("Audit log check successful.");
    } catch (error: any) {
        console.error("DB Connection Error:", error.message);
        console.error("Error Code:", error.code);
        console.error("Error Meta:", JSON.stringify(error.meta, null, 2));
        if (error.stack) console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

main();
