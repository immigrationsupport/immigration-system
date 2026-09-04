"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

interface SuperAdminLayoutClientProps {
    children: React.ReactNode;
    userName: string;
    agencyName: string | null;
}

export default function SuperAdminLayoutClient({
    children,
    userName,
    agencyName,
}: SuperAdminLayoutClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const superAdminSidebarItems = [
        { icon: "LayoutDashboard", label: "Agencies", href: "/super-admin/dashboard" },
        { icon: "CreditCard", label: "Payments", href: "/super-admin/dashboard/payments" },
        { icon: "UserCog", label: "Users", href: "/super-admin/dashboard/users" },
        { icon: "Settings", label: "Settings", href: "/super-admin/dashboard/settings" },
    ];

    return (
        <div className="flex bg-white min-h-screen" style={{ fontFamily: "var(--font-geist-sans)" }}>
            <Sidebar
                items={superAdminSidebarItems}
                userRole="Super Admin"
                userName={userName}
                agencyName={agencyName}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

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
