"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Users, UserCog, FileText, Settings as SettingsIcon, Briefcase, FolderSearch, List, MessageSquare } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Map strings to their respective Lucide icons
const iconMap: Record<string, any> = {
    LayoutDashboard,
    Users,
    UserCog,
    FileText,
    SettingsIcon,
    Briefcase,
    FolderSearch,
    List,
    MessageSquare
};

interface SidebarItem {
    icon: string;
    label: string;
    href: string;
}

interface SidebarProps {
    items: SidebarItem[];
    userRole: string;
    userName: string;
}

export function Sidebar({ items, userRole, userName }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push(userRole.toUpperCase() === "CLIENT" ? "/sign-in" : "/admin/login");
                }
            }
        });
    };

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-30">
            <div className="flex items-center justify-center h-16 border-b border-gray-200 px-6">
                <span className="text-xl font-bold text-[var(--color-primary)] tracking-wide">ATLE Immigration</span>
            </div>

            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-[var(--color-primary)] font-bold">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                        <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = iconMap[item.icon] || LayoutDashboard;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                ? "bg-[var(--color-secondary)] text-[var(--color-primary)]"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <IconComponent className={`mr-3 h-5 w-5 ${isActive ? "text-[var(--color-primary)]" : "text-gray-400"}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
