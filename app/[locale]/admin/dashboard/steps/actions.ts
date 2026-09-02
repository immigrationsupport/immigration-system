"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAgencyTemplates, getTemplateSteps } from "@/lib/steps-server";
import { StepDefinition, APP_STEP_SEQUENCE } from "@/lib/steps";
import { ProcedureType } from "@prisma/client";
import { getTranslations } from "next-intl/server";

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
        // Clone the agency's current "Default" workflow as the starting
        // point for every new one — so if the admin edits Default (adds,
        // removes, or renames steps), all workflows created afterwards
        // pick up that change automatically. Falls back to the built-in
        // 11-step catalog only if no "Default" workflow exists at all
        // (e.g. it was renamed or deleted).
        const defaultTemplate = await prisma.applicationTemplate.findFirst({
            where: { agencyId: ctx.agencyId, name: "Default" }
        });

        const seedSteps = defaultTemplate
            ? await getTemplateSteps(defaultTemplate.id)
            : await (async () => {
                  // No "Default" workflow to clone from (rare) — fall back to
                  // the built-in 11-step catalog, pre-filled in the admin's
                  // current language so they see readable text to start
                  // editing from (this is just a starting value, still free
                  // text they can rename).
                  const t = await getTranslations("stepTypeLabels");
                  return APP_STEP_SEQUENCE.map((type, index) => ({
                      type: type as ProcedureType,
                      label: t(type),
                      description: null as string | null,
                      order: index,
                      subSteps: [] as { label: string; description: string | null; order: number }[],
                      requiredDocuments: [] as string[]
                  }));
              })();

        const template = await prisma.applicationTemplate.create({
            data: {
                agencyId: ctx.agencyId,
                name: name.trim(),
                description: description?.trim() || null,
                steps: {
                    create: seedSteps.map((s, index) => ({
                        type: s.type,
                        label: s.label,
                        description: s.description,
                        order: index,
                        requiredDocuments: s.requiredDocuments,
                        subSteps: {
                            create: s.subSteps.map((sub, subIndex) => ({
                                label: sub.label,
                                description: sub.description,
                                order: subIndex
                            }))
                        }
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

export async function deleteTemplateAction(templateId: string, confirmationName?: string) {
    const ctx = await requireAdmin();
    if (!ctx) return { error: "Unauthorized access." };

    try {
        const template = await prisma.applicationTemplate.findUnique({ where: { id: templateId } });
        if (!template || template.agencyId !== ctx.agencyId) return { error: "Workflow not found." };
        if (confirmationName?.trim() !== template.name) {
            return { error: "Type the workflow name exactly to confirm deletion." };
        }

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
    requiredDocuments: string[];
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
                        requiredDocuments: (s.requiredDocuments || []).map((d) => d.trim()).filter(Boolean),
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
    const t = await getTranslations("stepTypeLabels");
    return APP_STEP_SEQUENCE.map((type) => ({ type, label: t(type) }));
}