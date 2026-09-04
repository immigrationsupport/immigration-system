import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMyAgencyName } from "@/lib/agency-actions";
import SuperAdminLayoutClient from "./SuperAdminLayoutClient";

export default async function SuperAdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        redirect("/super-admin/login");
    }

    const agencyName = await getMyAgencyName();

    return (
        <SuperAdminLayoutClient
            userName={session?.user?.name || "Super Admin"}
            agencyName={agencyName}
        >
            {children}
        </SuperAdminLayoutClient>
    );
}