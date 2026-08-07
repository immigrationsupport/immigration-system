"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return null;
    }
    return session;
}

export async function getAllPlans() {
    const session = await requireSuperAdmin();
    if (!session) throw new Error("Unauthorized");

    return prisma.plan.findMany({
        orderBy: { priceFcfa: "asc" },
        include: { _count: { select: { subscriptions: true } } },
    });
}

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
    if (value === null) return null;
    const trimmed = (value as string).trim();
    if (trimmed === "") return null;
    const n = parseInt(trimmed, 10);
    return Number.isNaN(n) ? null : n;
}

export async function createPlanAction(formData: FormData) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    const name = (formData.get("name") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim()?.toLowerCase();
    const priceFcfa = parseInt((formData.get("priceFcfa") as string) || "0", 10);
    const maxAgents = parseOptionalInt(formData.get("maxAgents"));
    const maxClients = parseOptionalInt(formData.get("maxClients"));
    const isPublic = formData.get("isPublic") === "on";

    if (!name || !slug) return { error: "Name and slug are required." };
    if (Number.isNaN(priceFcfa) || priceFcfa < 0) return { error: "Price must be a positive number." };

    try {
        const existing = await prisma.plan.findUnique({ where: { slug } });
        if (existing) return { error: "A plan with this slug already exists." };

        const plan = await prisma.plan.create({
            data: { name, slug, priceFcfa, maxAgents, maxClients, isPublic },
        });

        await prisma.auditLog.create({
            data: {
                action: "CREATE_PLAN",
                details: `Plan "${name}" created by Super Admin.`,
                userId: session.user.id,
                targetId: plan.id,
            },
        });

        revalidatePath("/super-admin/dashboard/settings");
        return { success: true };
    } catch (e: any) {
        console.error("Create plan error:", e);
        return { error: "Failed to create plan." };
    }
}

export async function updatePlanAction(planId: string, formData: FormData) {
    const session = await requireSuperAdmin();
    if (!session) return { error: "Unauthorized access." };

    const name = (formData.get("name") as string)?.trim();
    const priceFcfa = parseInt((formData.get("priceFcfa") as string) || "0", 10);
    const maxAgents = parseOptionalInt(formData.get("maxAgents"));
    const maxClients = parseOptionalInt(formData.get("maxClients"));
    const isPublic = formData.get("isPublic") === "on";

    if (!name) return { error: "Name is required." };
    if (Number.isNaN(priceFcfa) || priceFcfa < 0) return { error: "Price must be a positive number." };

    try {
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) return { error: "Plan not found." };

        await prisma.plan.update({
            where: { id: planId },
            data: { name, priceFcfa, maxAgents, maxClients, isPublic },
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_PLAN",
                details: `Plan "${name}" updated by Super Admin.`,
                userId: session.user.id,
                targetId: planId,
            },
        });

        revalidatePath("/super-admin/dashboard/settings");
        return { success: true };
    } catch (e: any) {
        console.error("Update plan error:", e);
        return { error: "Failed to update plan." };
    }
}