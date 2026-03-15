import React, { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import AdminStats from "@/components/dashboard/AdminStats";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/admin/login");
    }

    const adminSidebarItems = [
        { icon: "LayoutDashboard", label: "Overview", href: "/admin/dashboard" },
        { icon: "Briefcase", label: "Manage Agents", href: "/admin/dashboard/agents" },
        { icon: "Users", label: "Manage Clients", href: "/admin/dashboard/clients" },
        { icon: "FileText", label: "All Applications", href: "/admin/dashboard/applications" },
        { icon: "FolderSearch", label: "Documents Monitoring", href: "/admin/dashboard/documents" },
        { icon: "List", label: "System Logs", href: "/admin/dashboard/logs" }
    ];

    return (
        <div className="flex bg-white min-h-screen" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {/* Sidebar */}
            <Sidebar
                items={adminSidebarItems}
                userRole="Admin"
                userName={session?.user?.name || "System Admin"}
            />

            {/* Main Content wrapper */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                <Header title="" showLogout={true} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full mx-auto" style={{ backgroundColor: "#F9FAFB" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

