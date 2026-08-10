"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ApplicationStatus, ProcedureStatus } from "@prisma/client";
import { STEP_LABELS } from "@/lib/steps";
import { getMyAgencyName } from "@/lib/agency-actions";
export async function updateApplicationStatusAction(
    applicationId: string,
    newStatus: string,
    modificationMessage?: string
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    try {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { client: true }
        });

        if (!application) return { error: "Application not found." };
        
        await prisma.$transaction(async (tx) => {
            // 1. Update Application status
            await tx.application.update({
                where: { id: applicationId },
                data: { status: newStatus as ApplicationStatus }
            });

            // 2. Audit Log
            await tx.auditLog.create({
                data: {
                    action: "STATUS_UPDATE",
                    details: `Application ${applicationId} status updated to ${newStatus} for ${application.client.name}.`,
                    userId: session.user.id,
                    targetId: applicationId
                }
            });

            // 3. System Message & Official Message (if message provided)
            if (modificationMessage) {
                const firstStep = await tx.applicationStep.findFirst({
                    where: { applicationId },
                    orderBy: { updatedAt: "asc" }
                });

                if (firstStep) {
                    const actorRoleLabel = (session.user as any).role === "ADMIN" ? "ADMIN" : "AGENT";
                    await tx.message.create({
                        data: {
                            content: `${actorRoleLabel} UPDATE: ${modificationMessage}`,
                            procedureId: firstStep.id,
                            senderId: session.user.id
                        }
                    });
                }

                // Also create an OFFICIAL MESSAGE for the client dashboard
                await tx.officialMessage.create({
                    data: {
                        subject: `Application Update: ${newStatus}`,
                        content: modificationMessage,
                        senderId: session.user.id,
                        receiverId: application.clientId
                    }
                });
            }
        });

        revalidatePath("/dashboard/agent/applications");
        revalidatePath(`/dashboard/agent/applications/${applicationId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Status Update Error:", e);
        return { error: e.message || "Failed to update status." };
    }
}

import { sendEmail } from "@/lib/resend";

export async function updateStepAction(
    stepId: string,
    data: {
        status?: ProcedureStatus;
        isLocked?: boolean;
        description?: string;
        organization?: string; // New field for Step 5
    }
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    try {
        const step = await prisma.applicationStep.findUnique({
            where: { id: stepId },
            include: { 
                application: {
                    include: { 
                        steps: true,
                        client: true 
                    }
                },
                Document: true
            }
        });

        if (!step) return { error: "Step not found." };

        const appSteps = [...step.application.steps].sort((a, b) => a.order - b.order);
        const currentIdx = appSteps.findIndex(s => s.id === step.id);

        // Validation for "APPROVED" status
        if (data.status === "APPROVED") {
            // ... (rest of validation)
            if (currentIdx > 0) {
                const previousSteps = appSteps.slice(0, currentIdx);
                const allPreviousApproved = previousSteps.every(s => s.status === "APPROVED");
                if (!allPreviousApproved) {
                    return { error: "Must approve previous steps before completing this one." };
                }
            }

            if (step.type === "DOCUMENT_COLLECTION") {
                const requiredDocs = ["Passport", "Birth Certificate", "National ID", "CV", "Diploma", "Transcripts", "Passport Photo"];
                const uploadedNames = step.Document.map(d => d.name);
                const missing = requiredDocs.filter(d => !uploadedNames.includes(d));
                if (missing.length > 0) {
                    return { error: `Cannot complete step. Missing documents: ${missing.join(", ")}` };
                }
            }

            if (step.type === "PROFILE_CREATION") {
                const hasConfirmation = step.Document.some(d => d.name.startsWith("Profile_Confirmation_"));
                if (!hasConfirmation) {
                    return { error: "Cannot complete step. Profile confirmation screenshot is missing." };
                }
            }
        }

        // Store organization in description if it's Step 5
        let updateData: any = { ...data };
        if (step.type === "DIPLOMA_EQUIVALENCE" && data.organization) {
            updateData.description = `Org: ${data.organization}${data.description ? ` | ${data.description}` : ""}`;
            delete updateData.organization;
        }

        const updatedStep = await prisma.applicationStep.update({
            where: { id: stepId },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });

        // Create an Official Message if this is a modification request (ACTION_REQUIRED)
        if (data.status === "ACTION_REQUIRED" && data.description) {
            const stepLabel = step.label || STEP_LABELS[step.type as keyof typeof STEP_LABELS] || step.type;
            
            // 1. Create database record
            await prisma.officialMessage.create({
                data: {
                    subject: `Action Required: ${stepLabel}`,
                    content: data.description,
                    senderId: session.user.id,
                    receiverId: step.application.clientId
                }
            });

            // 2. Send email notification via Resend
            if (step.application.client.email) {
                const agencyName = await getMyAgencyName();
                await sendEmail({
                    to: step.application.client.email,
                    subject: `Action Required - ${agencyName || "ATLE Immigration"}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                            <div style="background-color: #1E3A8A; padding: 20px; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 20px;">Modification Requested</h1>
                            </div>
                            <div style="padding: 30px;">
                                <p style="font-size: 16px; color: #374151;">Hello <strong>${step.application.client.name}</strong>,</p>
                                <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
                                    An agent has requested a modification on your application step: <br/>
                                    <strong style="color: #1E3A8A;">${stepLabel}</strong>
                                </p>
                                <div style="background-color: #f9fafb; border-left: 4px solid #1E3A8A; padding: 15px; margin: 20px 0;">
                                    <p style="font-size: 14px; color: #1f2937; margin: 0; font-style: italic;">
                                        "${data.description}"
                                    </p>
                                </div>
                                <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
                                    Please log in to your dashboard to view the full details and upload any required documents.
                                </p>
                            </div>
                        </div>
                    `
                });
            }
        }

        // Auto-unlock next step ONLY IF status is APPROVED
        if (data.status === "APPROVED") {
            if (currentIdx !== -1 && currentIdx < appSteps.length - 1) {
                const nextStep = appSteps[currentIdx + 1];

                if (nextStep && nextStep.isLocked) {
                    await prisma.applicationStep.update({
                        where: { id: nextStep.id },
                        data: {
                            isLocked: false,
                            status: "IN_PROGRESS"
                        }
                    });
                }
            }
        }

        // Audit Log — always record the actor's role (Agent vs Admin) so the
        // change is traceable even though both roles can act on a step.
        const actorRole = (session.user as any).role === "ADMIN" ? "Admin" : "Agent";
        await prisma.auditLog.create({
            data: {
                action: "STEP_UPDATE",
                details: `${actorRole} ${session.user.name} updated step ${step.type} (Status: ${data.status || step.status}).`,
                userId: session.user.id,
                targetId: step.applicationId
            }
        });

        revalidatePath(`/dashboard/agent/applications/${step.applicationId}`);
        return { success: true, step: updatedStep };
    } catch (e: any) {
        console.error("Step Update Error:", e);
        return { error: e.message || "Failed to update step." };
    }
}

export async function addStepCommentAction(stepId: string, comment: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    try {
        const step = await prisma.applicationStep.findUnique({
            where: { id: stepId }
        });

        if (!step) return { error: "Step not found." };

        await prisma.message.create({
            data: {
                content: comment,
                procedureId: step.id,
                senderId: session.user.id
            }
        });

        revalidatePath(`/dashboard/agent/applications/${step.applicationId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to add comment." };
    }
}

export async function addDocumentAction(stepId: string, name: string, fileUrl: string, type: string = "OTHER") {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    const agencyId = (session.user as any).agencyId;

    try {
        const step = await prisma.applicationStep.findUnique({
            where: { id: stepId },
            include: { application: { include: { client: true } } }
        });

        if (!step) return { error: "Step not found." };
        if (step.application.agencyId !== agencyId) return { error: "This application does not belong to your agency." };

        const document = await prisma.document.create({
            data: {
                name,
                fileUrl,
                type: type as any,
                status: "UPLOADED",
                procedureId: stepId,
                uploaderId: session.user.id,
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "DOCUMENT_UPLOAD",
                details: `${session.user.name} uploaded "${name}" for ${step.application.client.name}'s ${step.type} step.`,
                userId: session.user.id,
                agencyId,
                targetId: step.applicationId
            }
        });

        revalidatePath(`/dashboard/agent/applications/${step.applicationId}`);
        return { success: true, document };
    } catch (e: any) {
        console.error("Document upload error:", e);
        return { error: e.message || "Failed to attach document." };
    }
}

export async function deleteDocumentAction(documentId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    const agencyId = (session.user as any).agencyId;

    try {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { Procedure: { include: { application: true } } }
        });

        if (!document) return { error: "Document not found." };
        if (document.Procedure.application.agencyId !== agencyId) return { error: "This document does not belong to your agency." };

        await prisma.document.delete({ where: { id: documentId } });

        await prisma.auditLog.create({
            data: {
                action: "DOCUMENT_DELETE",
                details: `${session.user.name} removed document "${document.name}".`,
                userId: session.user.id,
                agencyId,
                targetId: document.Procedure.applicationId
            }
        });

        revalidatePath(`/dashboard/agent/applications/${document.Procedure.applicationId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to delete document." };
    }
}