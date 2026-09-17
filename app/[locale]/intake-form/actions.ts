"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auditDetails } from "@/lib/audit-log";
import { extractProfileSyncFields } from "@/lib/intake-form/engine";
import { createS3UploadUrl, createS3DownloadUrl } from "@/lib/s3";
import crypto from "crypto";

async function requireClient() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "CLIENT") return null;
    return session;
}

/**
 * Fetches the client's in-progress or submitted intake form, creating an
 * empty draft on first visit.
 */
export async function getOrCreateIntakeFormAction() {
    const session = await requireClient();
    if (!session) return { error: "Unauthorized access." };

    try {
        const existing = await prisma.intakeFormResponse.findUnique({
            where: { clientId: session.user.id },
        });

        if (existing) {
            return { success: true, form: existing };
        }

        const created = await prisma.intakeFormResponse.create({
            data: { clientId: session.user.id },
        });

        return { success: true, form: created };
    } catch (e: any) {
        console.error("Get/create intake form error:", e);
        return { error: "Failed to load the intake form." };
    }
}

/**
 * Saves progress so far — called after every step, so the client can leave
 * and come back later without losing anything already answered.
 */
export async function saveIntakeFormProgressAction(
    answers: Record<string, any>,
    currentSection: string | null
) {
    const session = await requireClient();
    if (!session) return { error: "Unauthorized access." };

    try {
        const existing = await prisma.intakeFormResponse.findUnique({
            where: { clientId: session.user.id },
        });

        if (existing?.status === "SUBMITTED") {
            return { error: "This form has already been submitted." };
        }

        if (!existing || !existing.invited) {
            return { error: "You are not authorized to fill out this form." };
        }

        await prisma.intakeFormResponse.upsert({
            where: { clientId: session.user.id },
            update: { answers, currentSection },
            create: { clientId: session.user.id, answers, currentSection },
        });

        return { success: true };
    } catch (e: any) {
        console.error("Save intake form progress error:", e);
        return { error: "Failed to save your progress." };
    }
}

/**
 * Final submission — locks the form, and syncs every answer that maps to
 * a profile field onto the client's User record (nationality, phone,
 * date of birth, marital status, etc.), saving the agent from re-typing
 * it all by hand.
 */
export async function submitIntakeFormAction(answers: Record<string, any>) {
    const session = await requireClient();
    if (!session) return { error: "Unauthorized access." };

    try {
        const existing = await prisma.intakeFormResponse.findUnique({
            where: { clientId: session.user.id },
        });

        if (existing?.status === "SUBMITTED") {
            return { error: "This form has already been submitted." };
        }

        if (!existing || !existing.invited) {
            return { error: "You are not authorized to fill out this form." };
        }

        const country = answers.destinationCountry || null;
        const profileUpdates = extractProfileSyncFields(country, answers);

        await prisma.$transaction(async (tx) => {
            await tx.intakeFormResponse.upsert({
                where: { clientId: session.user.id },
                update: {
                    answers,
                    country,
                    status: "SUBMITTED",
                    submittedAt: new Date(),
                },
                create: {
                    clientId: session.user.id,
                    answers,
                    country,
                    status: "SUBMITTED",
                    submittedAt: new Date(),
                },
            });

            if (Object.keys(profileUpdates).length > 0) {
                await tx.user.update({
                    where: { id: session.user.id },
                    data: profileUpdates,
                });
            }

            await tx.auditLog.create({
                data: {
                    action: "SUBMIT_INTAKE_FORM",
                    details: auditDetails("intakeFormSubmitted", {
                        clientName: session.user.name,
                        country: country || "N/A",
                    }),
                    userId: session.user.id,
                    agencyId: (session.user as any).agencyId,
                    targetId: session.user.id,
                },
            });
        });

        revalidatePath("/dashboard/client");
        return { success: true };
    } catch (e: any) {
        console.error("Submit intake form error:", e);
        return { error: "Failed to submit the form. Please try again." };
    }
}

const ALLOWED_TYPES: Record<string, number> = {
    "application/pdf": 10 * 1024 * 1024, // 10 MB
    "image/jpeg": 4 * 1024 * 1024, // 4 MB
    "image/png": 4 * 1024 * 1024, // 4 MB
};

/**
 * Step 1 of the upload — get a signed S3 PUT url. These documents aren't
 * attached to an ApplicationStep (none may exist yet for this client), so
 * they live in their own IntakeFormDocument table until an agent creates
 * the actual procedure and moves/re-references them as needed.
 */
export async function createIntakeFormUploadUrlAction(
    questionId: string,
    fileName: string,
    contentType: string,
    fileSize: number
) {
    const session = await requireClient();
    if (!session) return { error: "Unauthorized access." };

    if (!fileName || !fileName.trim()) return { error: "File name is required." };

    const maxForType = ALLOWED_TYPES[contentType];
    if (!maxForType) {
        return { error: "Only PDF, JPEG, and PNG files are accepted." };
    }
    if (fileSize > maxForType) {
        const maxMb = Math.round(maxForType / (1024 * 1024));
        return { error: `File is too large. Maximum size is ${maxMb} MB for this file type.` };
    }

    try {
        const safeFileName = fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = ["intake-form-documents", session.user.id, questionId, `${crypto.randomUUID()}-${safeFileName}`].join("/");

        const uploadUrl = await createS3UploadUrl(key, contentType);

        return { success: true, uploadUrl, storageKey: key };
    } catch (e: any) {
        console.error("Create intake form upload URL error:", e);
        return { error: "Failed to prepare the upload." };
    }
}

/**
 * Step 2 — called once the browser has successfully PUT the file to S3.
 * Replaces any earlier upload for this exact question (re-uploading = swap,
 * not duplicate).
 */
export async function confirmIntakeFormUploadAction(questionId: string, fileName: string, storageKey: string) {
    const session = await requireClient();
    if (!session) return { error: "Unauthorized access." };

    try {
        await prisma.intakeFormDocument.deleteMany({
            where: { clientId: session.user.id, questionId },
        });

        const doc = await prisma.intakeFormDocument.create({
            data: {
                clientId: session.user.id,
                questionId,
                fileName,
                storageKey,
            },
        });

        return { success: true, document: { id: doc.id, questionId: doc.questionId, fileName: doc.fileName } };
    } catch (e: any) {
        console.error("Confirm intake form upload error:", e);
        return { error: "Failed to save the uploaded file." };
    }
}

export async function removeIntakeFormDocumentAction(questionId: string) {
    const session = await requireClient();
    if (!session) return { error: "Unauthorized access." };

    try {
        await prisma.intakeFormDocument.deleteMany({
            where: { clientId: session.user.id, questionId },
        });
        return { success: true };
    } catch (e: any) {
        console.error("Remove intake form document error:", e);
        return { error: "Failed to remove the file." };
    }
}

/**
 * Agent/admin-facing — a short-lived download link for a specific
 * uploaded intake-form document, scoped to the same agency as the client.
 */
export async function getIntakeFormDocumentUrlAction(documentId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    try {
        const doc = await prisma.intakeFormDocument.findUnique({
            where: { id: documentId },
            include: { client: { select: { agencyId: true } } },
        });

        if (!doc) return { error: "Document not found." };

        const agencyId = (session.user as any).agencyId;
        if (doc.client.agencyId !== agencyId) return { error: "Unauthorized access." };

        const url = await createS3DownloadUrl(doc.storageKey);
        return { success: true, url };
    } catch (e: any) {
        console.error("Get intake form document URL error:", e);
        return { error: "Failed to generate the download link." };
    }
}