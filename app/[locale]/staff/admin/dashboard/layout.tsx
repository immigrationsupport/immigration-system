"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import {
    LayoutDashboard,
    Users,
    UserCog,
    FileText,
    Settings as SettingsIcon
} from "lucide-react";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const adminSidebarItems = [
        {
            icon: "LayoutDashboard",
            label: "Overview",
            href: "/staff/admin/dashboard"
        },
        {
            icon: "UserCog",
            label: "Manage Agents",
            href: "/staff/admin/dashboard/agents"
        },
        {
            icon: "Users",
            label: "Manage Clients",
            href: "/staff/admin/dashboard/clients"
        },
        {
            icon: "FileText",
            label: "All Procedures",
            href: "/staff/admin/dashboard/applications"
        },
        {
            icon: "SettingsIcon",
            label: "Settings",
            href: "/staff/admin/dashboard/settings"
        }
    ];

    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <Sidebar
                items={adminSidebarItems}
                userRole="Administrator"
                userName="Admin User"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content wrapper */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative max-w-full">
                <Header 
                    title="Admin Dashboard" 
                    showLogout={true} 
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
