import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMyAgencyName } from "@/lib/agency-actions";
import { getTranslations } from "next-intl/server";
import { SuperAdminDashboardShell } from "./dashboard-shell";

export default async function SuperAdminDashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        redirect("/sign-in");
    }

    const { locale } = await params;
    const t = await getTranslations("superAdminDashboard");
    const agencyName = await getMyAgencyName();

    const superAdminSidebarItems = [
        { icon: "LayoutDashboard", label: t("nav.dashboard"), href: `/${locale}/super-admin/dashboard` },
        { icon: "Building2", label: t("nav.agencies"), href: `/${locale}/super-admin/dashboard/agencies` },
        { icon: "CreditCard", label: t("nav.payments"), href: `/${locale}/super-admin/dashboard/payments` },
        { icon: "UserCog", label: t("nav.users"), href: `/${locale}/super-admin/dashboard/users` },
        { icon: "List", label: t("nav.history"), href: `/${locale}/super-admin/dashboard/logs` },
        { icon: "Settings", label: t("nav.settings"), href: `/${locale}/super-admin/dashboard/settings` },
    ];

    return (
        <SuperAdminDashboardShell
            items={superAdminSidebarItems}
            userRole={t("role")}
            userName={session.user.name || t("defaultUserName")}
            agencyName={agencyName}
            locale={locale}
        >
            {children}
        </SuperAdminDashboardShell>
    );
}