import { ProcedureType } from "@prisma/client";
import prisma from "@/lib/prisma";

export const APP_STEP_SEQUENCE: ProcedureType[] = [
    "REGISTRATION",
    "CONTRACT_SIGNING",
    "FEE_PAYMENT",
    "DOCUMENT_COLLECTION",
    "DIPLOMA_EQUIVALENCE",
    "LANGUAGE_TEST_REGISTRATION",
    "LANGUAGE_TEST_RESULTS",
    "PROFILE_CREATION",
    "APPLICATION_SUBMISSION",
    "MEDICAL_EXAMINATION",
    "PASSPORT_SUBMISSION"
];

export const STEP_LABELS: Record<ProcedureType, string> = {
    REGISTRATION: "Registration",
    CONTRACT_SIGNING: "Contract Signing",
    FEE_PAYMENT: "Fee Payment",
    DOCUMENT_COLLECTION: "Document Collection",
    DIPLOMA_EQUIVALENCE: "Diploma Equivalence",
    LANGUAGE_TEST_REGISTRATION: "Language Test Registration",
    LANGUAGE_TEST_RESULTS: "Language Test Results",
    PROFILE_CREATION: "Profile Creation",
    APPLICATION_SUBMISSION: "Application Submission",
    MEDICAL_EXAMINATION: "Medical Examination",
    PASSPORT_SUBMISSION: "Passport Submission & Visa Processing"
};

export interface StepDefinition {
    type: ProcedureType;
    label: string;
    description: string | null;
    order: number;
}

/**
 * The steps a NEW application for this agency should be built from, in
 * order. Falls back to the original fixed 11-step sequence for any agency
 * that has never customized its steps — so nothing changes for agencies
 * that don't touch this feature.
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

/** Every possible step an agency could enable, with its built-in default label — used to seed the admin's customization screen. */
export function getDefaultStepCatalog(): { type: ProcedureType; label: string }[] {
    return APP_STEP_SEQUENCE.map((type) => ({ type, label: STEP_LABELS[type] }));
}