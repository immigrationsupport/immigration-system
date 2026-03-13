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
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) return { error: "Session expired. Please login again." };

        const procedureId = formData.get("procedureId")?.toString();
        const name = formData.get("name")?.toString();
        const type = formData.get("type")?.toString();
        const file = formData.get("file") as File;

        if (!procedureId || !name || !type || !file || file.size === 0) {
            return { error: "Missing required information. Please ensure a file and category are selected." };
        }

        // MOCK STORAGE: In a real app we'd upload to S3/UploadThing here.
        const fileUrl = `/mock-storage/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

        const procedure = await prisma.procedure.findUnique({
            where: { id: procedureId },
            include: { application: true }
        });

        if (!procedure) return { error: "Application section not found." };
        
        if (procedure.application.clientId !== session.user.id) {
            return { error: "You do not have permission to modify this application." };
        }

        if (procedure.isLocked) {
            return { error: "This section is currently locked for review." };
        }

        // Create the document
        await prisma.document.create({
            data: {
                name: name.trim(),
                fileUrl,
                type: type as any,
                procedureId,
                uploaderId: session.user.id,
                status: "UPLOADED"
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "DOCUMENT_UPLOAD",
                details: `Client uploaded ${name} for ${procedure.application.country} application.`,
                userId: session.user.id,
                targetId: procedure.applicationId
            }
        });

        revalidatePath(`/dashboard/client/applications/${procedure.applicationId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Document Upload Error:", e);
        return { error: e.message || "A server error occurred during upload. Please try again." };
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
