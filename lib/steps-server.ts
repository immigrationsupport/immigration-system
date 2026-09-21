import prisma from "@/lib/prisma";
import { APP_STEP_SEQUENCE, StepDefinition, STEP_LABELS, getDetailedDefaultSteps } from "@/lib/steps";

/**
 * Server-only: touches Prisma directly. Only import this from server
 * actions or server components — never from a "use client" file, or its
 * Prisma/pg dependency chain gets bundled into the browser build.
 */

/**
 * Makes sure an agency has at least one ApplicationTemplate to work with.
 * If it has none yet, seeds a "Default" template from the detailed
 * 19-step Express Entry journey (provided by an immigration expert) — so
 * both the template manager and the "New Application" picker always have
 * something realistic to show right away.
 */
export async function ensureDefaultTemplate(agencyId: string) {
    const existing = await prisma.applicationTemplate.findFirst({ where: { agencyId } });
    if (existing) return;

    const seedSteps = getDetailedDefaultSteps();

    await prisma.applicationTemplate.create({
        data: {
            agencyId,
            name: "Default",
            description: "The standard application workflow.",
            steps: {
                create: seedSteps.map((s, index) => ({
                    type: s.type,
                    // Built-in default labels are never stored — only a
                    // genuinely custom literal label is persisted, so the
                    // display layer can still localize built-in type names.
                    label:
                        s.type && s.label?.trim() === STEP_LABELS[s.type]
                            ? null
                            : s.label?.trim() || null,
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
}

export interface TemplateSummary {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    stepCount: number;
}

export async function getAgencyTemplates(agencyId: string): Promise<TemplateSummary[]> {
    await ensureDefaultTemplate(agencyId);

    const templates = await prisma.applicationTemplate.findMany({
        where: { agencyId },
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { steps: true } } }
    });

    return templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        isActive: t.isActive,
        stepCount: t._count.steps
    }));
}

/** Full step (+ sub-step) breakdown for one template, ordered — used both to render the editor and to materialize a new application's steps. */
export async function getTemplateSteps(templateId: string): Promise<StepDefinition[]> {
    const steps = await prisma.stepTemplate.findMany({
        where: { applicationTemplateId: templateId, isActive: true },
        orderBy: { order: "asc" },
        include: { subSteps: { orderBy: { order: "asc" } } }
    });

    return steps.map((s) => ({
        type: s.type,
        label: s.label,
        description: s.description,
        order: s.order,
        subSteps: s.subSteps.map((sub) => ({
            label: sub.label,
            description: sub.description,
            order: sub.order
        })),
        requiredDocuments: s.requiredDocuments
    }));
}

/**
 * Backward-compatible helper for flows that haven't been wired up to the
 * template picker yet (e.g. the agent's existing "new application" form).
 * Uses the agency's Default template, auto-seeding it if needed.
 */
export async function getAgencyStepDefinitions(agencyId?: string | null): Promise<StepDefinition[]> {
    if (agencyId) {
        await ensureDefaultTemplate(agencyId);
        const defaultTemplate = await prisma.applicationTemplate.findFirst({
            where: { agencyId, name: "Default" },
            orderBy: { createdAt: "asc" }
        });
        if (defaultTemplate) {
            return getTemplateSteps(defaultTemplate.id);
        }
    }

    return getDetailedDefaultSteps().map((s, index) => ({
        ...s,
        order: index,
    }));
}