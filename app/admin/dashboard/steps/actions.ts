"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAgencyTemplates, getTemplateSteps } from "@/lib/steps-server";
import { STEP_LABELS, StepDefinition } from "@/lib/steps";
import { ProcedureType } from "@prisma/client";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "ADMIN") return null;
    const agencyId = (session.user as any).agencyId;
    if (!agencyId) return null;
    return { session, agencyId };
}

export async function getTemplates() {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };
    return { templates: await getAgencyTemplates(ctx.agencyId) };
}

export async function createTemplateAction(name: string, description: string) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };

    if (!name || !name.trim()) return { error: "Give this workflow a name." };

    try {
        const template = await prisma.applicationTemplate.create({
            data: {
                agencyId: ctx.agencyId,
                name: name.trim(),
                description: description?.trim() || null,
                // Pre-fill the 11 standard steps so the admin edits from a
                // useful starting point instead of a blank page — they can
                // still rename, reorder, delete, or add to any of these.
                steps: {
                    create: Object.entries(STEP_LABELS).map(([type, label], index) => ({
                        type: type as ProcedureType,
                        label,
                        order: index
                    }))
                }
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "CREATE_APPLICATION_TEMPLATE",
                details: `Admin ${ctx.session.user.name} created the application workflow "${template.name}".`,
                userId: ctx.session.user.id,
                agencyId: ctx.agencyId,
                targetId: template.id
            }
        });

        revalidatePath("/admin/dashboard/steps");
        return { success: true, templateId: template.id };
    } catch (e: any) {
        console.error("Create template error:", e);
        return { error: "Failed to create the workflow." };
    }
}

export async function deleteTemplateAction(templateId: string) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };

    try {
        const template = await prisma.applicationTemplate.findUnique({ where: { id: templateId } });
        if (!template || template.agencyId !== ctx.agencyId) return { error: "Workflow not found." };

        const inUse = await prisma.application.count({ where: { applicationTemplateId: templateId } });
        if (inUse > 0) {
            // Don't delete history out from under real applications — just hide it from future use.
            await prisma.applicationTemplate.update({ where: { id: templateId }, data: { isActive: false } });
        } else {
            await prisma.applicationTemplate.delete({ where: { id: templateId } });
        }

        revalidatePath("/admin/dashboard/steps");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to remove the workflow." };
    }
}

export async function getTemplateForEditing(templateId: string) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };

    const template = await prisma.applicationTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.agencyId !== ctx.agencyId) return { error: "Workflow not found." };

    const steps = await getTemplateSteps(templateId);
    return { template: { id: template.id, name: template.name, description: template.description }, steps };
}

export interface StepInput {
    type: ProcedureType | null;
    label: string;
    description: string;
    isActive: boolean;
    subSteps: { label: string; description: string }[];
}

export async function saveTemplateStepsAction(templateId: string, steps: StepInput[]) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };

    const template = await prisma.applicationTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.agencyId !== ctx.agencyId) return { error: "Workflow not found." };

    if (!Array.isArray(steps) || steps.length === 0) {
        return { error: "At least one step is required." };
    }
    for (const s of steps) {
        if (!s.label || !s.label.trim()) return { error: "Every step needs a name." };
    }
    if (!steps.some((s) => s.isActive)) {
        return { error: "At least one step must be active." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.stepTemplate.deleteMany({ where: { applicationTemplateId: templateId } });

            for (let i = 0; i < steps.length; i++) {
                const s = steps[i];
                await tx.stepTemplate.create({
                    data: {
                        applicationTemplateId: templateId,
                        type: s.type || null,
                        label: s.label.trim(),
                        description: s.description?.trim() || null,
                        order: i,
                        isActive: s.isActive,
                        subSteps: {
                            create: s.subSteps
                                .filter((sub) => sub.label && sub.label.trim())
                                .map((sub, subIndex) => ({
                                    label: sub.label.trim(),
                                    description: sub.description?.trim() || null,
                                    order: subIndex
                                }))
                        }
                    }
                });
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "UPDATE_APPLICATION_TEMPLATE",
                details: `Admin ${ctx.session.user.name} updated the application workflow "${template.name}".`,
                userId: ctx.session.user.id,
                agencyId: ctx.agencyId,
                targetId: templateId
            }
        });

        revalidatePath(`/admin/dashboard/steps/${templateId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Save template steps error:", e);
        return { error: "Failed to save the workflow." };
    }
}

/** Built-in step types an admin can optionally attach to a step, to keep that type's special behavior (document checks, etc.) */
export async function getBuiltInTypeOptions() {
    return Object.entries(STEP_LABELS).map(([type, label]) => ({ type: type as ProcedureType, label }));
}