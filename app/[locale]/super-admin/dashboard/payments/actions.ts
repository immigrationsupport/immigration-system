"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

async function requireSuperAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return null;
    }
    return session;
}

export async function getAllPayments() {
    const session = await requireSuperAdmin();
    if (!session) throw new Error("Unauthorized");

    const payments = await prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            subscription: {
                include: {
                    agency: { select: { id: true, name: true, isInternal: true } },
                    plan: { select: { id: true, name: true, slug: true } },
                },
            },
        },
    });

    return payments;
}