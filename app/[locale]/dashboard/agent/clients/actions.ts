"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    const agencyId = (session.user as any).agencyId;
    if (!agencyId) {
        return { error: "Your account is not linked to an agency." };
    }

    const isAgent = (session.user as any).role === "AGENT";

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim()?.toLowerCase();
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "All fields are required." };
    }

    if (name.length > 50) {
        return { error: "Name must be 50 characters or less." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: "Invalid email format." };
    }

    if (password.length < 8) {
        return { error: "Password must be at least 8 characters." };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: "A user with this email already exists." };
        }

        const hashedPassword = await hashPassword(password);

        // An agent creating a client is auto-assigned as that client's agent.
        // An admin creating a client leaves it unassigned — assignable later
        // from Manage Clients, same as clients coming in any other way.
        const newClient = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "CLIENT" as any,
                status: "ACTIVE" as any,
                agencyId,
                agentId: isAgent ? session.user.id : null,
                emailVerified: true,
                accounts: {
                    create: {
                        providerId: "credential",
                        accountId: email,
                        password: hashedPassword,
                    }
                }
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "CREATE_CLIENT",
                details: `Client ${name} (${email}) created by ${isAgent ? "Agent" : "Admin"} ${session.user.name}.`,
                userId: session.user.id,
                agencyId,
                targetId: newClient.id,
            }
        });

        revalidatePath("/dashboard/agent/clients");
        return { success: true };
    } catch (e: any) {
        console.error("Client creation error:", e);
        return { error: "An error occurred while creating the client." };
    }
}