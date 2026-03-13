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
                targetId: newUser.id,
            }
        });

        revalidatePath("/admin/dashboard/agents");
        return { success: true };
    } catch (e: any) {
        console.error("Creation Error:", e);
        return { error: "An error occurred while creating the agent." };
    }
}

export async function toggleSuspendAgentAction(agentId: string, currentlySuspended: boolean) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    try {
        const agent = await prisma.user.findUnique({ where: { id: agentId } });
        if (!agent) return { error: "Agent not found." };

        await prisma.user.update({
            where: { id: agentId },
            data: { isSuspended: !currentlySuspended }
        });

        await prisma.auditLog.create({
            data: {
                action: currentlySuspended ? "UNSUSPEND_AGENT" : "SUSPEND_AGENT",
                details: `Agent ${agent.name} (${agent.email}) ${currentlySuspended ? "unsuspended" : "suspended"} by Admin.`,
                userId: session.user.id,
                targetId: agentId
            }
        });

        revalidatePath("/admin/dashboard/agents");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to update agent status." };
    }
}

export async function deleteAgentAction(agentId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    try {
        const agent = await prisma.user.findUnique({ where: { id: agentId } });
        
        await prisma.user.delete({
            where: { id: agentId }
        });

        await prisma.auditLog.create({
            data: {
                action: "DELETE_AGENT",
                details: `Agent ${agent?.name} (${agent?.email}) deleted by Admin.`,
                userId: session.user.id,
                targetId: agentId
            }
        });

        revalidatePath("/admin/dashboard/agents");
        return { success: true };
    } catch (e: any) {
        console.error("Delete Error:", e);
        return { error: "Failed to delete agent. They might have assigned clients." };
    }
}

export async function updateAgentAction(agentId: string, name: string, email: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    if (!name || !email) {
        return { error: "Name and email are required." };
    }

    try {
        await prisma.user.update({
            where: { id: agentId },
            data: { 
                name, 
                email: email.toLowerCase() 
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_AGENT",
                details: `Agent ${name} (${email}) details updated by Admin.`,
                userId: session.user.id,
                targetId: agentId
            }
        });

        revalidatePath("/admin/dashboard/agents");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to update agent details." };
    }
}
