"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LogOut, LayoutDashboard, Users, UserCog, FileText,
    Settings as SettingsIcon, Briefcase, FolderSearch,
    List, MessageSquare, X, Menu,CreditCard, ListOrdered,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const iconMap: Record<string, any> = {
    LayoutDashboard, Users, UserCog, FileText,
    Settings: SettingsIcon, Briefcase, FolderSearch,
    List, MessageSquare, CreditCard,  ListOrdered
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
    agencyName?: string | null;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ items, userRole, userName, agencyName, isOpen: externalIsOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    
    const toggleSidebar = (value: boolean) => {
        if (onClose && !value) {
            onClose();
        } else {
            setInternalIsOpen(value);
        }
    };

    const handleLogout = async () => {
        const role = userRole.toUpperCase();
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    if (role === "AGENT" || role === "ADMIN") {
                        router.push("/admin/login");
                    } else {
                        router.push("/sign-in");
                    }
                }
            }
        });
    };

    const SidebarContent = (
        <aside
            className={`fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
                w-[75vw] max-w-[280px] sm:w-64 lg:w-64 xl:w-72
                ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
                md:translate-x-0 md:shadow-none md:z-30
            `}
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4 xl:px-6 shrink-0">
                <Link
                    href="/dashboard"
                    className="text-base xl:text-xl font-bold text-[var(--color-primary)] tracking-wide truncate hover:opacity-80 transition-opacity"
                >
                    {agencyName || "ATLE Immigration"}
                </Link>
                <button
                    onClick={() => toggleSidebar(false)}
                    className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 shrink-0"
                    aria-label="Close menu"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* User info */}
            <div className="px-4 xl:px-6 py-4 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-[var(--color-primary)] font-bold shrink-0 text-sm xl:text-base">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                        <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 xl:px-4 py-4 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href || pathname.endsWith(item.href);
                    const IconComponent = iconMap[item.icon] || LayoutDashboard;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => toggleSidebar(false)}
                            className={`flex items-center px-3 xl:px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                                isActive
                                    ? "bg-[var(--color-secondary)] text-[var(--color-primary)] shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <IconComponent
                                className={`mr-3 h-5 w-5 shrink-0 ${
                                    isActive ? "text-[var(--color-primary)]" : "text-gray-400"
                                }`}
                            />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 xl:px-4 py-4 border-t border-gray-200 shrink-0">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 xl:px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogOut className="mr-3 h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform" />
                    Logout
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* ── Mobile top bar ── */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
                <button
                    onClick={() => toggleSidebar(true)}
                    className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <Link href="/dashboard" className="text-base font-bold text-[var(--color-primary)] tracking-wide truncate max-w-[50vw]">
                    {agencyName || "ATLE Immigration"}
                </Link>
                {/* Avatar shortcut */}
                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-[var(--color-primary)] font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                </div>
            </header>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => toggleSidebar(false)}
                />
            )}

            {SidebarContent}
        </>
    );
}