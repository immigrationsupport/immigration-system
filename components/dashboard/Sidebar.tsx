"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LogOut, LayoutDashboard, Users, UserCog, FileText,
    Settings as SettingsIcon, Briefcase, FolderSearch,
    List, MessageSquare, X, Menu, CreditCard, ListOrdered,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const iconMap: Record<string, any> = {
    LayoutDashboard, Users, UserCog, FileText,
    Settings: SettingsIcon, Briefcase, FolderSearch,
    List, MessageSquare, CreditCard, ListOrdered
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

    const close = () => {
        if (onClose) onClose();
        else setInternalIsOpen(false);
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

    return (
        <>
            {/* ── Dark backdrop (mobile only) ── */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={close}
                aria-hidden="true"
            />

            {/* ── Sidebar panel ── */}
            <aside
                className={`
                    fixed left-0 top-0 z-50 h-screen flex flex-col
                    bg-white border-r border-gray-100
                    w-[78vw] max-w-[300px] sm:max-w-[280px]
                    md:w-64 lg:w-64 xl:w-72
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
                    md:translate-x-0 md:shadow-none md:z-30
                `}
            >
                {/* Logo / brand */}
                <div className="flex items-center justify-between h-14 md:h-16 border-b border-gray-100 px-4 xl:px-6 shrink-0">
                    <Link
                        href="/dashboard"
                        className="text-base xl:text-lg font-extrabold text-[var(--color-primary)] tracking-wide truncate hover:opacity-80 transition-opacity"
                    >
                        {agencyName || "ATLE Immigration"}
                    </Link>
                    {/* Close button — mobile only */}
                    <button
                        onClick={close}
                        className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User info */}
                <div className="px-4 xl:px-6 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-[var(--color-primary)] font-bold shrink-0 text-sm xl:text-base">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                            <p className="text-xs text-gray-400 capitalize">{userRole}</p>
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 xl:px-4 py-4 space-y-0.5">
                    {items.map((item) => {
                        const isActive = pathname === item.href || pathname.endsWith(item.href);
                        const IconComponent = iconMap[item.icon] || LayoutDashboard;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={close}
                                className={`flex items-center px-3 xl:px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                                    isActive
                                        ? "bg-[var(--color-secondary)] text-[var(--color-primary)] shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                                <IconComponent
                                    className={`mr-3 h-4.5 w-4.5 h-5 w-5 shrink-0 ${
                                        isActive ? "text-[var(--color-primary)]" : "text-gray-400"
                                    }`}
                                />
                                <span className="truncate">{item.label}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 xl:px-4 py-4 border-t border-gray-100 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-3 xl:px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all group"
                    >
                        <LogOut className="mr-3 h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}