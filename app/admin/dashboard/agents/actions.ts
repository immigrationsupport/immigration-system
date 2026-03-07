"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto"; // Use Better Auth utility
import { revalidatePath } from "next/cache";

export async function createAgentAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // 1. Permission Check
    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "All fields are required." };
    }

    try {
        // 2. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return { error: "A user with this email already exists." };
        }

        // 3. Hash the password using Better Auth's expected algorithm (scrypt)
        const hashedPassword = await hashPassword(password);

        // 4. Create the user record and associated credential account
        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword, // Saved to User table
                role: "AGENT" as any,
                emailVerified: true,
                accounts: {
                    create: {
                        providerId: "credential",
                        accountId: email.toLowerCase(),
                        password: hashedPassword, // Required by Better Auth email/password provider
                    }
                }
            }
        });

        // 5. Audit Logging
        await prisma.auditLog.create({
            data: {
                action: "CREATE_AGENT",
                details: `Agent ${name} (${email}) created by Admin.`,
                userId: session.user.id,
            }
        });

        revalidatePath("/admin/dashboard/agents");
        return { success: true };
    } catch (e: any) {
        console.error("Creation Error:", e);
        return { error: "An error occurred while creating the agent." };
    }
}