"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDefaultStepCatalog, STEP_LABELS } from "@/lib/steps";
import { ProcedureType } from "@prisma/client";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "ADMIN") return null;
    const agencyId = (session.user as any).agencyId;
    if (!agencyId) return null;
    return { session, agencyId };
}

export interface StepTemplateRow {
    type: ProcedureType;
    label: string;
    description: string | null;
    order: number;
    isActive: boolean;
}

export async function getStepTemplates(): Promise<StepTemplateRow[] | { error: string }> {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };

    const saved = await prisma.stepTemplate.findMany({
        where: { agencyId: ctx.agencyId },
        orderBy: { order: "asc" }
    });

    if (saved.length > 0) {
        return saved.map((t) => ({
            type: t.type,
            label: t.label,
            description: t.description,
            order: t.order,
            isActive: t.isActive
        }));
    }

    // Nothing customized yet — hand back the built-in defaults so the admin
    // has something to start editing from.
    return getDefaultStepCatalog().map((s, index) => ({
        type: s.type,
        label: s.label,
        description: null,
        order: index,
        isActive: true
    }));
}

export async function saveStepTemplatesAction(rows: StepTemplateRow[]) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };
    const { session, agencyId } = ctx;

    if (!Array.isArray(rows) || rows.length === 0) {
        return { error: "At least one step is required." };
    }

    const validTypes = new Set(Object.keys(STEP_LABELS));
    const seenTypes = new Set<string>();

    for (const row of rows) {
        if (!validTypes.has(row.type)) {
            return { error: `Unknown step type: ${row.type}` };
        }
        if (seenTypes.has(row.type)) {
            return { error: `Duplicate step: ${STEP_LABELS[row.type]}` };
        }
        seenTypes.add(row.type);

        if (!row.label || !row.label.trim()) {
            return { error: "Every step needs a name." };
        }
    }

    if (!rows.some((r) => r.isActive)) {
        return { error: "At least one step must be active." };
    }

    try {
        await prisma.$transaction([
            prisma.stepTemplate.deleteMany({ where: { agencyId } }),
            prisma.stepTemplate.createMany({
                data: rows.map((row, index) => ({
                    agencyId,
                    type: row.type,
                    label: row.label.trim(),
                    description: row.description?.trim() || null,
                    order: index,
                    isActive: row.isActive
                }))
            })
        ]);

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_STEP_TEMPLATE",
                details: `Admin ${session.user.name} customized the application step workflow.`,
                userId: session.user.id,
                agencyId
            }
        });

        revalidatePath("/admin/dashboard/settings");
        return { success: true };
    } catch (e: any) {
        console.error("Save step templates error:", e);
        return { error: "Failed to save the step workflow." };
    }
}

export async function resetStepTemplatesAction() {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };
    const { session, agencyId } = ctx;

    try {
        await prisma.stepTemplate.deleteMany({ where: { agencyId } });

        await prisma.auditLog.create({
            data: {
                action: "RESET_STEP_TEMPLATE",
                details: `Admin ${session.user.name} reset the application step workflow to the default.`,
                userId: session.user.id,
                agencyId
            }
        });

        revalidatePath("/admin/dashboard/settings");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to reset the step workflow." };
    }
}