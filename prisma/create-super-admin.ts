/**
 * Phase 2 — bootstrap script.
 *
 * Creates the very first Super Admin account. Nobody can create a Super
 * Admin through the UI (only a Super Admin can, and there isn't one yet),
 * so this has to be seeded directly. Run it once:
 *
 *   npx tsx prisma/create-super-admin.ts "Your Name" you@example.com "a-strong-password"
 */
import "dotenv/config";
import prisma from "../lib/prisma";
import { hashPassword } from "better-auth/crypto";

async function main() {
    const [, , name, email, password] = process.argv;

    if (!name || !email || !password) {
        console.error("Usage: npx tsx prisma/create-super-admin.ts \"Full Name\" email@example.com password");
        process.exit(1);
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
        console.error(`A user with email ${email} already exists (role: ${existing.role}).`);
        process.exit(1);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "SUPER_ADMIN" as any,
            emailVerified: true,
            accounts: {
                create: {
                    providerId: "credential",
                    accountId: email.toLowerCase(),
                    password: hashedPassword,
                }
            }
        }
    });

    console.log(`Super Admin created: ${user.email} (id: ${user.id})`);
    console.log("You can now sign in at /super-admin/login");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });