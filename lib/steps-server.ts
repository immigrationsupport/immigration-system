import prisma from "@/lib/prisma";
import { APP_STEP_SEQUENCE, StepDefinition } from "@/lib/steps";

/**
 * Server-only: touches Prisma directly. Only import this from server
 * actions or server components — never from a "use client" file, or its
 * Prisma/pg dependency chain gets bundled into the browser build.
 */

/**
 * Makes sure an agency has at least one ApplicationTemplate to work with.
 * If it has none yet, seeds a "Default" template from the original fixed
 * 11-step sequence — so both the template manager and the "New
 * Application" picker always have something to show, and nothing an
 * agency already relied on breaks.
 */
export async function ensureDefaultTemplate(agencyId: string) {
    const existing = await prisma.applicationTemplate.findFirst({ where: { agencyId } });
    if (existing) return;

    await prisma.applicationTemplate.create({
        data: {
            agencyId,
            name: "Default",
            description: "The standard application workflow.",
            steps: {
                create: APP_STEP_SEQUENCE.map((type, index) => ({
                    type,
                    // Leave label unset for built-in types — the display
                    // layer translates by `type` via stepTypeLabels. Baking
                    // the English STEP_LABELS text in here would make
                    // step.label always win over the translation, so the
                    // step name would never actually localize.
                    label: null,
                    order: index
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

    return APP_STEP_SEQUENCE.map((type, index) => ({
        type,
        label: null,
        description: null,
        order: index,
        subSteps: [],
        requiredDocuments: []
    }));
}