"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auditDetails } from "@/lib/audit-log";
import { getAllQuestions, getAnsweredQuestionsBySection, formatAnswerForDisplay } from "@/lib/intake-form/engine";

export async function getApplicationDetails(applicationId: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
            return { error: "Unauthorized access." };
        }

        const agencyId = (session.user as any).agencyId;

        const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        dateOfBirth: true,
                        nationality: true,
                        maritalStatus: true,
                        phoneNumber: true,
                        address: true
                    }
                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                steps: {
                    include: {
                        Document: {
                            orderBy: {
                                uploadedAt: "desc"
                            }
                        },
                        subSteps: {
                            orderBy: {
                                order: "asc"
                            }
                        }
                    },
                    orderBy: {
                        updatedAt: "asc"
                    }
                }
            }
        }) as any;

        if (!app) return { error: "Procedure not found." };
        if (app.agencyId !== agencyId) {
            return { error: "This application does not belong to your agency." };
        }

        // Pull in whatever the client already provided via the intake form
        // (documents + language test info), same as the agent's view, so
        // the admin doesn't have to open a separate screen to see it.
        const [intakeFormResponse, intakeFormDocuments] = await Promise.all([
            prisma.intakeFormResponse.findUnique({ where: { clientId: app.client.id } }),
            prisma.intakeFormDocument.findMany({ where: { clientId: app.client.id } })
        ]);

        const intakeAnswers = (intakeFormResponse?.answers as Record<string, any>) || {};
        const intakeCountry = intakeFormResponse?.country || null;
        const allQuestions = getAllQuestions(intakeCountry);

        const languageTestInfo = allQuestions
            .filter((q) => /test|score/i.test(q.id) && intakeAnswers[q.id] !== undefined && intakeAnswers[q.id] !== "")
            .map((q) => ({ label: q.label, value: formatAnswerForDisplay(q, intakeAnswers[q.id]) }));

        const intakeDocumentsForDisplay = intakeFormDocuments.map((doc) => ({
            id: doc.id,
            fileName: doc.fileName,
            questionId: doc.questionId,
            questionLabel: allQuestions.find((q) => q.id === doc.questionId)?.label || doc.questionId
        }));

        // Full section-by-section Q&A (every question, not just the
        // document/language-test subset above), rendered inline in this
        // same modal — same data the agent's questionnaire page uses.
        const questionnaireSections = intakeFormResponse
            ? getAnsweredQuestionsBySection(intakeCountry, intakeAnswers).map((section) => ({
                  section: section.section,
                  label: section.label,
                  questions: section.questions.map((q) => ({
                      id: q.id,
                      label: q.label,
                      value: formatAnswerForDisplay(q, intakeAnswers[q.id]),
                      document: intakeDocumentsForDisplay.find((d) => d.questionId === q.id) || null
                  }))
              }))
            : [];

        const mappedApp = {
            ...app,
            destination: app.country,
            type: app.steps[0]?.type || "GENERAL",
            intakeDocuments: intakeDocumentsForDisplay,
            languageTestInfo,
            questionnaireSections,
            questionnaireStatus: intakeFormResponse?.status || null
        };

        return { success: true, application: mappedApp };
    } catch (e: any) {
        return { error: e.message || "Failed to fetch details" };
    }
}

export async function unlockApplication(applicationId: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
            return { error: "Unauthorized access." };
        }

        const agencyId = (session.user as any).agencyId;

        const existing = await prisma.application.findUnique({
            where: { id: applicationId }
        });

        if (!existing) return { error: "Procedure not found." };

        if (existing.agencyId !== agencyId) {
            return { error: "This application does not belong to your agency." };
        }

        await prisma.application.update({
            where: { id: applicationId },
            data: { status: "IN_PROGRESS" }
        });

        await prisma.applicationStep.updateMany({
            where: { applicationId },
            data: { isLocked: false }
        });

        await prisma.auditLog.create({
            data: {
                action: "APPLICATION_UNLOCKED",
                details: auditDetails("applicationUnlocked", { applicationId }),
                userId: session.user.id,
                agencyId,
                targetId: applicationId
            }
        });

        revalidatePath("/admin/dashboard/applications");

        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to unlock application." };
    }
}