import prisma from "@/lib/prisma";
import { APP_STEP_SEQUENCE, STEP_LABELS, StepDefinition } from "@/lib/steps";

/**
 * The steps a NEW application for this agency should be built from, in
 * order. Falls back to the original fixed 11-step sequence for any agency
 * that has never customized its steps — so nothing changes for agencies
 * that don't touch this feature.
 *
 * Server-only: touches Prisma directly. Only import this from server
 * actions or server components — never from a "use client" file, or its
 * Prisma/pg dependency chain gets bundled into the browser build.
 */
export async function getAgencyStepDefinitions(agencyId?: string | null): Promise<StepDefinition[]> {
    if (agencyId) {
        const templates = await prisma.stepTemplate.findMany({
            where: { agencyId, isActive: true },
            orderBy: { order: "asc" }
        });

        if (templates.length > 0) {
            return templates.map((t) => ({
                type: t.type,
                label: t.label,
                description: t.description,
                order: t.order
            }));
        }
    }

    return APP_STEP_SEQUENCE.map((type, index) => ({
        type,
        label: STEP_LABELS[type],
        description: null,
        order: index
    }));
}