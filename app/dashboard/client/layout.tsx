"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const pathname = usePathname();

    const navItems = [
        { label: "Dashboard", href: "/dashboard/client" },
        { label: "Applications", href: "/dashboard/client/applications" },
        { label: "Official Messages", href: "/dashboard/client/messages" },
        { label: "Profile", href: "/dashboard/client/profile" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-[#1E3A8A] flex items-center tracking-wide">
                                    <div className="w-8 h-8 bg-[#1E3A8A] mr-3 rounded-sm flex items-center justify-center">
                                        <span className="text-white text-lg font-serif">A</span>
                                    </div>
                                    ATLE Client
                                </span>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                                    ? "border-[#1E3A8A] text-gray-900"
                                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <div className="flex items-center text-sm font-medium text-gray-500 mr-4">
                                {session?.user?.name || "Client User"}
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
