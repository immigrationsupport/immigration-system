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

/**
 * English fallback labels for the built-in procedure types.
 * These are identifiers/fallbacks only; the UI should use next-intl
 * `stepTypeLabels` for the actual language shown to the user.
 */
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
    // Null for a built-in type using its default translated name. A literal
    // value is only stored when an admin intentionally gives the step a custom name.
    label: string | null;
    description: string | null;
    order: number;
    subSteps: SubStepDefinition[];
    // Default document checklist for this step (e.g. ["Passport", "CV"]).
    requiredDocuments: string[];
}

export function getDefaultStepLabel(type: ProcedureType): string {
    return STEP_LABELS[type];
}

/** Every possible step an agency could enable, with its built-in default label. */
export function getDefaultStepCatalog(): { type: ProcedureType; label: string }[] {
    return APP_STEP_SEQUENCE.map((type) => ({ type, label: STEP_LABELS[type] }));
}

export interface FriendlyStatusStep {
    type: ProcedureType | null;
    order: number;
    status: string; // ProcedureStatus
}

/**
 * Derives a clearer, business-meaningful status for the agency to see at a
 * glance, from an expert's feedback that "Pending" is too vague. Based on
 * step TYPE and relative ORDER (never a fixed step number), so it works
 * for any workflow shape — the detailed 19-step template, a customized
 * version of it, or an entirely different country's workflow — degrading
 * gracefully wherever a given type isn't present. Pure in-memory logic on
 * data already fetched for display, so it adds no extra queries or delay.
 *
 * Mapping, per the expert's step-by-step rules (E<n> = "Étape n" in the
 * detailed 19-step template):
 *   - Préliminaire en cours .......... E1 through E8 (before the Express
 *                                       Entry profile, E9, is created)
 *   - Attente d'une invitation ....... E9 done, E10 in progress
 *   - Préparation de la demande de RP  E11 in progress
 *   - Traitement IRCC en cours ....... E12 onward, until the passport step
 *   - Demande de RP approuvée ........ E17 approved (or app marked done)
 *   - Demande rejetée ................ application rejected
 *   - Attente de paiement ............ payment step is the one currently
 *                                       blocking progress (can appear
 *                                       anywhere the fee-payment step sits)
 */
export function getFriendlyStatus(
    applicationStatus: string,
    steps: FriendlyStatusStep[]
): string {
    if (applicationStatus === "REJECTED") return "Demande rejetée";

    const byType = (type: ProcedureType) => steps.find((s) => s.type === type);

    const feePayment = byType("FEE_PAYMENT");
    const profileCreation = byType("PROFILE_CREATION"); // E9
    const applicationSubmission = byType("APPLICATION_SUBMISSION"); // E11
    const passportSubmission = byType("PASSPORT_SUBMISSION"); // E17

    // E17 — passport step approved (or the application itself marked done)
    // is the clearest, most reliable "approved" signal.
    if (
        applicationStatus === "APPROVED" ||
        applicationStatus === "COMPLETED" ||
        (passportSubmission && passportSubmission.status === "APPROVED")
    ) {
        return "Demande de RP approuvée";
    }

    // The step the client is actually waiting on right now: the first one,
    // in order, that isn't approved yet. Everything below reads off of
    // this — never off "the furthest step ever touched" — so an
    // application stuck early (e.g. on payment) is never mistaken for one
    // that has progressed much further, which was the bug: the previous
    // version flagged "Attente de paiement" the instant fee payment was
    // PENDING anywhere in the list, even before that step was reached.
    const currentStep = [...steps]
        .sort((a, b) => a.order - b.order)
        .find((s) => s.status !== "APPROVED");

    // Fee payment is genuinely what's blocking progress right now.
    if (
        feePayment &&
        currentStep &&
        currentStep.order === feePayment.order &&
        feePayment.status !== "APPROVED"
    ) {
        return "Attente de paiement";
    }

    // E12 onward — the RP application is filed and now sits with IRCC
    // (biometrics, processing, ADR, interview...) until E17 is reached.
    if (
        applicationSubmission &&
        applicationSubmission.status === "APPROVED" &&
        (!passportSubmission || passportSubmission.status !== "APPROVED")
    ) {
        return "Traitement IRCC en cours";
    }

    // E11 — the RP application itself is actively being assembled/submitted.
    if (
        applicationSubmission &&
        currentStep &&
        currentStep.order === applicationSubmission.order
    ) {
        return "Préparation de la demande de RP en cours";
    }

    // E9 done, waiting on the invitation (ITA) before the RP application
    // (E11) can start.
    if (
        profileCreation &&
        profileCreation.status === "APPROVED" &&
        (!applicationSubmission || applicationSubmission.status !== "APPROVED")
    ) {
        return "Attente d'une invitation";
    }

    // E1 through E8: everything before the Express Entry profile is created.
    return "Préliminaire en cours";
}

/**
 * Detailed 19-step Express Entry journey (Canada), provided by an
 * immigration expert to replace the generic 11-step default. Steps map to
 * a built-in ProcedureType where one genuinely matches (so they keep that
 * type's special fields/automations); everything else is a plain custom
 * step with a French label — no schema change needed for new step types.
 * Used as the seed template for a brand-new agency's very first workflow.
 */
export function getDetailedDefaultSteps(): StepDefinition[] {
    const step = (
        type: ProcedureType | null,
        label: string | null,
        order: number,
        subSteps: SubStepDefinition[] = []
    ): StepDefinition => ({
        type,
        label,
        description: null,
        order,
        subSteps,
        requiredDocuments: [],
    });

    return [
        step("REGISTRATION", null, 0),
        step("CONTRACT_SIGNING", null, 1),
        step("FEE_PAYMENT", null, 2),
        step("DOCUMENT_COLLECTION", "Collecte de documents et d'information et analyse", 3),
        step("DIPLOMA_EQUIVALENCE", null, 4),
        step("LANGUAGE_TEST_REGISTRATION", null, 5),
        step(null, "Préparation du ou des tests de langue", 6),
        step("LANGUAGE_TEST_RESULTS", null, 7),
        step("PROFILE_CREATION", "Création de la demande Entrée Express", 8),
        step(null, "Attente d'une invitation à présenter une demande de résidence permanente", 9),
        step(
            "APPLICATION_SUBMISSION",
            "Préparation de la demande de résidence permanente pour soumission",
            10,
            [{ label: "Examen médical", description: null, order: 0 }]
        ),
        step(null, "Traitement de la demande par IRCC en cours et attente d'instruction biométrique", 11),
        step(null, "Biométrie en cours", 12),
        step(null, "Traitement de la demande par IRCC en cours", 13),
        step(null, "Traitement d'ADR (Additional Documents Request) éventuel", 14),
        step(null, "Entrevue avec un agent IRCC éventuelle", 15),
        step("PASSPORT_SUBMISSION", "Soumission du passeport pour visa", 16),
        step(null, "Préparation du voyage avant arrivée (optionnel pour le client)", 17),
        step(null, "Suivi après arrivée (optionnel pour le client)", 18),
    ];
}