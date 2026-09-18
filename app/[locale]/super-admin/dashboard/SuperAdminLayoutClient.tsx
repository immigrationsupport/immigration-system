"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

interface SidebarItem {
    icon: string;
    label: string;
    href: string;
}

interface SuperAdminLayoutClientProps {
    children: React.ReactNode;
    items: SidebarItem[];
    userRole: string;
    userName: string;
    agencyName: string | null;
    locale?: string;
}

export default function SuperAdminLayoutClient({
    children,
    items,
    userRole,
    userName,
    agencyName,
    locale,
}: SuperAdminLayoutClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-white min-h-screen" style={{ fontFamily: "var(--font-geist-sans)" }}>
            <Sidebar
                items={items}
                userRole={userRole}
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
                    locale={locale}
                />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full mx-auto" style={{ backgroundColor: "#F9FAFB" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}