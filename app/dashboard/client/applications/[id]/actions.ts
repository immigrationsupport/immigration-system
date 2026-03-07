"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitProcedureAction(procedureId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return { error: "Unauthorized" };

    const procedure = await prisma.procedure.findUnique({
        where: { id: procedureId },
        include: { application: true }
    });

    if (!procedure || procedure.application.clientId !== session.user.id) {
        return { error: "Procedure not found." };
    }

    if (procedure.isLocked) {
        return { error: "Procedure is already submitted and locked." };
    }

    try {
        await prisma.procedure.update({
            where: { id: procedureId },
            data: {
                isLocked: true,
                status: "IN_PROGRESS"
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "PROCEDURE_SUBMISSION",
                details: `Client submitted procedure ${procedureId} for ${procedure.application.country}.`,
                userId: session.user.id
            }
        });

        revalidatePath(`/dashboard/client/applications/${procedure.applicationId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to submit procedure." };
    }
}

export async function addDocumentAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return { error: "Unauthorized" };

    const procedureId = formData.get("procedureId") as string;
    const name = formData.get("name") as string;
    const fileUrl = formData.get("fileUrl") as string; // Typically should be from storage
    const type = formData.get("type") as string;

    const procedure = await prisma.procedure.findUnique({
        where: { id: procedureId },
        include: { application: true }
    });

    if (!procedure || procedure.application.clientId !== session.user.id) {
        return { error: "Procedure not found." };
    }

    if (procedure.isLocked) {
        return { error: "Cannot add documents to a locked procedure." };
    }

    try {
        await prisma.document.create({
            data: {
                name,
                fileUrl,
                type: type as any,
                procedureId,
                uploaderId: session.user.id
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "DOCUMENT_UPLOAD",
                details: `Client uploaded document "${name}" for procedure ${procedureId}.`,
                userId: session.user.id
            }
        });

        revalidatePath(`/dashboard/client/applications/${procedure.applicationId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to add document." };
    }
}

export async function deleteDocumentAction(documentId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return { error: "Unauthorized" };

    const doc = await prisma.document.findUnique({
        where: { id: documentId },
        include: { procedure: { include: { application: true } } }
    });

    if (!doc || doc.procedure.application.clientId !== session.user.id) {
        return { error: "Document not found." };
    }

    if (doc.procedure.isLocked) {
        return { error: "Cannot delete documents from a locked procedure." };
    }

    try {
        await prisma.document.delete({
            where: { id: documentId }
        });

        revalidatePath(`/dashboard/client/applications/${doc.procedure.applicationId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to delete document." };
    }
}
