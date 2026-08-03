"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * Returns the display name of the current user's own agency, or null for
 * accounts with no agency (e.g. Super Admin). Safe to call from any
 * authenticated user — only ever returns their own agency's public name.
 */
export async function getMyAgencyName(): Promise<string | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    const agencyId = (session?.user as any)?.agencyId;
    if (!agencyId) return null;

    const agency = await prisma.agency.findUnique({
        where: { id: agencyId },
        select: { name: true }
    });

    return agency?.name || null;
}