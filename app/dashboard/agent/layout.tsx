"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Users, FileText, MessageSquare, User, LayoutDashboard } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const agentItems = [
        { icon: "Users", label: "Assigned Clients", href: "/dashboard/agent/clients" },
        { icon: "FileText", label: "Assigned Applications", href: "/dashboard/agent/applications" },
        { icon: "MessageSquare", label: "Messages", href: "/dashboard/agent/messages" },
        { icon: "UserCog", label: "Profile", href: "/dashboard/agent/profile" },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                items={agentItems}
                userRole="Agent"
                userName={session?.user?.name || "Agent User"}
            />
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <Header title="Agent Dashboard" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
