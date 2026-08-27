"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateDocumentStatusAction(documentId: string, status: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    try {
        const doc = await prisma.document.findUnique({
            where: { id: documentId }
        });

        if (!doc) return { error: "Document not found." };

        await prisma.document.update({
            where: { id: documentId },
            data: { status: status as any }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "UPDATE_DOCUMENT_STATUS",
                details: `Document "${doc.name}" status updated to ${status} by Admin.`,
                userId: session.user.id
            }
        });

        revalidatePath("/admin/dashboard/documents");
        return { success: true };
    } catch (e: any) {
        console.error("Update Document Error:", e);
        return { error: e.message || "Failed to update document." };
    }
}
