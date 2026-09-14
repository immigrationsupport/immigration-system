"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auditDetails } from "@/lib/audit-log";

export async function updateAgencySettingsAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    const agencyId = (session.user as any).agencyId;
    if (!agencyId) {
        return { error: "Your account is not associated with an agency." };
    }

    const agencyName = (formData.get("agencyName") as string)?.trim();
    const agencyEmail = (formData.get("agencyEmail") as string)?.trim()?.toLowerCase();
    const agencyPhone = (formData.get("agencyPhone") as string)?.trim();
    const agencyAddress = (formData.get("agencyAddress") as string)?.trim();
    const adminName = (formData.get("adminName") as string)?.trim();

    if (!agencyName) {
        return { error: "Agency name is required." };
    }

    try {
        // Update Agency
        const updatedAgency = await prisma.agency.update({
            where: { id: agencyId },
            data: {
                name: agencyName,
                email: agencyEmail || null,
                phone: agencyPhone || null,
                address: agencyAddress || null,
            },
        });

        // Update Admin user name if provided
        if (adminName && adminName !== session.user.name) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { name: adminName },
            });
        }

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                action: "UPDATE_AGENCY",
                details: auditDetails("agencyUpdated", {
                    name: agencyName,
                    email: agencyEmail || undefined,
                    updatedBy: session.user.name,
                }),
                userId: session.user.id,
                agencyId: agencyId,
                targetId: agencyId,
            },
        });

        revalidatePath("/admin/dashboard/settings");
        revalidatePath("/admin/dashboard");

        return {
            success: true,
            agency: updatedAgency,
        };
    } catch (e: any) {
        console.error("Update Agency Settings Error:", e);
        return { error: "An error occurred while updating agency settings." };
    }
}
