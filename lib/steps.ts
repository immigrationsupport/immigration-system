import { ProcedureType } from "@prisma/client";

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

export interface SubStepDefinition {
    label: string;
    description: string | null;
    order: number;
}

export interface StepDefinition {
    // Null for a fully custom step with no built-in behavior attached.
    type: ProcedureType | null;
    label: string;
    description: string | null;
    order: number;
    subSteps: SubStepDefinition[];
    // Default document checklist for this step (e.g. ["Passport", "CV"]).
    requiredDocuments: string[];
}

/** Every possible step an agency could enable, with its built-in default label — used to seed the admin's customization screen. */
export function getDefaultStepCatalog(): { type: ProcedureType; label: string }[] {
    return APP_STEP_SEQUENCE.map((type) => ({ type, label: STEP_LABELS[type] }));
}