"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FileText,
    FolderSearch,
    List,
    Settings as SettingsIcon
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getMyAgencyName } from "@/lib/agency-actions";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agencyName, setAgencyName] = useState<string | null>(null);

    useEffect(() => {
        // Simple role-based protection
        if (!isPending) {
            // Check if user is logged in
            if (!session) {
                router.push("/admin/login");
            }
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session) {
            getMyAgencyName().then(setAgencyName).catch(() => setAgencyName(null));
        }
    }, [session]);

    if (isPending) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!session) return null; // Prevent flicker while redirecting

    const adminSidebarItems = [
        { icon: "LayoutDashboard", label: "Overview", href: "/admin/dashboard" },
        { icon: "Briefcase", label: "Manage Agents", href: "/admin/dashboard/agents" },
        { icon: "Users", label: "Manage Clients", href: "/admin/dashboard/clients" },
        { icon: "FileText", label: "All Applications", href: "/admin/dashboard/applications" },
        { icon: "FolderSearch", label: "Documents Monitoring", href: "/admin/dashboard/documents" },
        { icon: "List", label: "System Logs", href: "/admin/dashboard/logs" },
        { icon: "Settings", label: "System Settings", href: "/admin/dashboard/settings" }
    ];

    return (
        <div className="flex bg-white min-h-screen" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {/* Sidebar */}
            <Sidebar
                items={adminSidebarItems}
                userRole="Admin"
                userName={session?.user?.name || "System Admin"}
                agencyName={agencyName}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content wrapper */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative max-w-full">
                <Header 
                    title="" 
                    showLogout={true} 
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full mx-auto" style={{ backgroundColor: "#F9FAFB" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}