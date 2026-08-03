"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Users, FileText, MessageSquare, User, LayoutDashboard } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { getMyAgencyName } from "@/lib/agency-actions";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [agencyName, setAgencyName] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            getMyAgencyName().then(setAgencyName);
        }
    }, [session?.user]);

    const agentItems = [
        { icon: "LayoutDashboard", label: "Overview", href: "/dashboard/agent" },
        { icon: "Users", label: "Assigned Clients", href: "/dashboard/agent/clients" },
        { icon: "FileText", label: "Assigned Applications", href: "/dashboard/agent/applications" },
        { icon: "UserCog", label: "Profile", href: "/dashboard/agent/profile" },
    ];

    return (
        <div className="flex h-screen bg-gray-50 max-w-full overflow-hidden">
            <Sidebar
                items={agentItems}
                userRole="Agent"
                userName={session?.user?.name || "Agent User"}
                agencyName={agencyName}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 relative max-w-full overflow-x-hidden">
                <Header title="Agent Dashboard" onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}