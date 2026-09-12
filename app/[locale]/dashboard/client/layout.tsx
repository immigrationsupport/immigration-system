"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "@/lib/auth-client";
import { LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getMyAgencyName } from "@/lib/agency-actions";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const t = useTranslations("navigation.dashboard.client");
    const tCommon = useTranslations("navigation.dashboard");
    const locale = useLocale();
    const [agencyName, setAgencyName] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (session?.user) {
            getMyAgencyName().then(setAgencyName);
        }
    }, [session?.user]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const displayName = agencyName || "Procedure Facile";

    const navItems = [
        { label: t("overview"), href: "/dashboard/client" },
        { label: t("applications"), href: "/dashboard/client/applications" },
        { label: t("messages"), href: "/dashboard/client/messages" },
        { label: t("profile"), href: "/dashboard/client/profile" },
    ];

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = "/sign-in";
                }
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link
                                    href="/dashboard/client"
                                    className="text-xl font-bold text-[#1E3A8A] flex items-center tracking-wide hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-8 h-8 bg-[#1E3A8A] mr-3 rounded-sm flex items-center justify-center shrink-0">
                                        <span className="text-white text-lg font-serif">{displayName.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="truncate max-w-[40vw] sm:max-w-none">{displayName}</span>
                                </Link>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                {navItems.map((item) => {
                                    const isActive = item.href === "/dashboard/client"
                                        ? pathname === item.href
                                        : pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                                    ? "border-[#1E3A8A] text-[#1E3A8A]"
                                                    : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200"
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
                            <div className="flex items-center rounded-full border border-gray-200 p-0.5 text-xs font-bold">
                                <Link
                                    href={pathname}
                                    locale="en"
                                    className={`px-2.5 py-1 rounded-full transition-colors ${locale === "en" ? "bg-[#1E3A8A] text-white" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    EN
                                </Link>
                                <Link
                                    href={pathname}
                                    locale="fr"
                                    className={`px-2.5 py-1 rounded-full transition-colors ${locale === "fr" ? "bg-[#1E3A8A] text-white" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    FR
                                </Link>
                            </div>
                            <div className="flex items-center text-sm font-medium text-gray-500">
                                {session?.user?.name || "Client User"}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {tCommon("logout")}
                            </button>
                        </div>

                        {/* Mobile menu button — this whole block never existed before */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setMobileMenuOpen((o) => !o)}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                aria-label="Menu"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu panel */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = item.href === "/dashboard/client"
                                ? pathname === item.href
                                : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive
                                            ? "bg-blue-50 text-[#1E3A8A]"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                            <div className="flex items-center rounded-full border border-gray-200 p-0.5 text-xs font-bold">
                                <Link
                                    href={pathname}
                                    locale="en"
                                    className={`px-2.5 py-1 rounded-full transition-colors ${locale === "en" ? "bg-[#1E3A8A] text-white" : "text-gray-500"}`}
                                >
                                    EN
                                </Link>
                                <Link
                                    href={pathname}
                                    locale="fr"
                                    className={`px-2.5 py-1 rounded-full transition-colors ${locale === "fr" ? "bg-[#1E3A8A] text-white" : "text-gray-500"}`}
                                >
                                    FR
                                </Link>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {tCommon("logout")}
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}