import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMyAgencyName } from "@/lib/agency-actions";

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

    const superAdminSidebarItems = [
        { icon: "LayoutDashboard", label: "Agencies", href: "/super-admin/dashboard" },
    ];

    return (
        <div className="flex bg-white min-h-screen" style={{ fontFamily: "var(--font-geist-sans)" }}>
            <Sidebar
                items={superAdminSidebarItems}
                userRole="Super Admin"
                userName={session?.user?.name || "Super Admin"}
                agencyName={agencyName}
            />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                <Header title="" showLogout={true} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full mx-auto" style={{ backgroundColor: "#F9FAFB" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}