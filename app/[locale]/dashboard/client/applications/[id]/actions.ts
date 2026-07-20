"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProcedureStatus } from "@prisma/client";
import { APP_STEP_SEQUENCE } from "@/lib/steps";

const AGENT_ONLY_STEPS = ["DIPLOMA_EQUIVALENCE", "PROFILE_CREATION", "APPLICATION_SUBMISSION", "PASSPORT_SUBMISSION"];

export async function submitProcedureAction(stepId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return { error: "Unauthorized" };

    const step = await prisma.applicationStep.findUnique({
        where: { id: stepId },
        include: { application: true }
    });

    if (!step || step.application.clientId !== session.user.id) {
        return { error: "Step not found." };
    }

    // Role-based validation: Clients cannot submit Agent-Only steps
    if (AGENT_ONLY_STEPS.includes(step.type)) {
        return { error: "This step is handled strictly by the agent. You will be notified when it is complete." };
    }

    if (step.isLocked && step.status !== "PENDING") {
        return { error: "This step is locked." };
    }

    try {
        const currentTypeIndex = APP_STEP_SEQUENCE.indexOf(step.type as any);
        const isClientFinalizableStep = currentTypeIndex < 4; // Steps 1 through 4 can be completed by the client

        if (isClientFinalizableStep) {
            await prisma.applicationStep.update({
                where: { id: stepId },
                data: {
                    isLocked: true,
                    status: "APPROVED" as ProcedureStatus,
                }
            });

            // Find the next step in the sequence and unlock it
            if (currentTypeIndex !== -1 && currentTypeIndex < APP_STEP_SEQUENCE.length - 1) {
                const nextType = APP_STEP_SEQUENCE[currentTypeIndex + 1];
                const nextStep = await prisma.applicationStep.findFirst({
                    where: { 
                        applicationId: step.applicationId,
                        type: nextType
                    }
                });

                if (nextStep) {
                    await prisma.applicationStep.update({
                        where: { id: nextStep.id },
                        data: {
                            isLocked: false,
                            status: "IN_PROGRESS" as ProcedureStatus
                        }
                    });
                }
            }
        } else {
            // For Step 5 and onwards, keep the step pending for agent review
            await prisma.applicationStep.update({
                where: { id: stepId },
                data: {
                    status: "IN_PROGRESS" as ProcedureStatus,
                    isLocked: true 
                }
            });
        }

        // Update overall application status if it was PENDING
        if (step.application.status === "PENDING") {
            await prisma.application.update({
                where: { id: step.applicationId },
                data: { status: "IN_PROGRESS" }
            });
        }

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "STEP_SUBMISSION",
                details: `Client completed step ${step.type} for ${step.application.country} application. Status: ${isInitialStep ? 'APPROVED' : 'IN_PROGRESS'}`,
                userId: session.user.id,
                targetId: step.applicationId
            }
        });

        revalidatePath(`/dashboard/client/applications/${step.applicationId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to submit step." };
    }
}

export async function addDocumentAction(formData: FormData) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) return { error: "Session expired. Please login again." };

        const procedureId = (formData.get("procedureId") || formData.get("stepId"))?.toString();
        const name = formData.get("name")?.toString();
        const type = formData.get("type")?.toString();
        const fileUrl = formData.get("fileUrl")?.toString();

        if (!procedureId || !name || !type || !fileUrl) {
            return { error: "Missing required information." };
        }

        const step = await prisma.applicationStep.findUnique({
            where: { id: procedureId },
            include: { application: true }
        });

        if (!step) return { error: "Application step not found." };
        
        if (step.application.clientId !== session.user.id) {
            return { error: "Unauthorized access." };
        }

        // Role-based validation: Clients cannot upload to Agent-Only steps (unless specifically allowed, e.g. Step 5)
        if (step.type !== "DIPLOMA_EQUIVALENCE" && AGENT_ONLY_STEPS.includes(step.type)) {
            return { error: "Uploads for this step are handled strictly by the agent." };
        }

        if (step.isLocked) {
            return { error: "This step is locked." };
        }

        // Create the document
        await prisma.document.create({
            data: {
                name: name.trim(),
                fileUrl,
                type: type as any,
                procedureId: procedureId as string,
                uploaderId: session.user.id,
                status: "UPLOADED"
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "DOCUMENT_UPLOAD",
                details: `Client uploaded ${name} for ${step.application.country} application.`,
                userId: session.user.id,
                targetId: step.applicationId
            }
        });

        revalidatePath(`/dashboard/client/applications/${step.applicationId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Document Upload Error:", e);
        return { error: e.message || "A server error occurred." };
    }
}

export async function deleteDocumentAction(documentId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return { error: "Unauthorized" };

    const doc = await prisma.document.findUnique({
        where: { id: documentId },
        include: { Procedure: { include: { application: true } } }
    });

    if (!doc || !doc.Procedure || doc.Procedure.application.clientId !== session.user.id) {
        return { error: "Document not found." };
    }

    if (doc.Procedure.isLocked) {
        return { error: "Step is locked." };
    }

    try {
        await prisma.document.delete({
            where: { id: documentId }
        });

        revalidatePath(`/dashboard/client/applications/${doc.Procedure?.applicationId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to delete document." };
    }
}
