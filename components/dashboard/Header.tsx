"use client";

import { Bell, Menu, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";

interface HeaderProps {
    title: string;
    onMenuClick?: () => void;
    showLogout?: boolean;
    centerSlot?: React.ReactNode;
    // Only pass this when Header is rendered inside a route under
    // app/[locale]/... — it's what turns on the EN/FR switcher. Routes
    // outside the locale structure (e.g. /super-admin/*) aren't localized
    // at all, so leave this undefined there and the switcher just won't
    // render — calling next-intl's locale-aware hooks unconditionally here
    // would otherwise crash on those routes, since they're not wrapped in
    // a NextIntlClientProvider.
    locale?: string;
}

export function Header({ title, onMenuClick, showLogout = false, centerSlot, locale }: HeaderProps) {
    const router = useRouter();
    const { data: session } = useSession();
    // Plain, locale-agnostic pathname — safe to call on every route,
    // localized or not.
    const pathname = usePathname();

    const handleLogout = async () => {
        const userRole = session?.user?.role?.toUpperCase();
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    if (userRole === "SUPER_ADMIN") {
                        router.push("/super-admin/login");
                    } else if (userRole === "AGENT" || userRole === "ADMIN") {
                        router.push("/admin/login");
                    } else {
                        router.push("/sign-in");
                    }
                }
            }
        });
    };

    // Swap the leading /en or /fr segment for the target locale, keeping
    // the rest of the path (and query string) intact.
    function localizedHref(targetLocale: "en" | "fr") {
        const withoutLocale = pathname.replace(/^\/(en|fr)(?=\/|$)/, "");
        return `/${targetLocale}${withoutLocale}`;
    }

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center gap-4 px-6 sticky top-0 z-20">
            <div className="flex items-center gap-4 shrink-0">
                {onMenuClick && (
                    <Button variant="outline" className="md:hidden" onClick={onMenuClick}>
                        <Menu className="h-6 w-6" />
                    </Button>
                )}
                <h1 className="text-xl font-semibold text-gray-800 tracking-tight">{title}</h1>
            </div>

            {centerSlot && (
                <div className="flex-1 min-w-0 hidden md:flex justify-center">
                    {centerSlot}
                </div>
            )}

            <div className="flex items-center gap-4 shrink-0 ml-auto">
                {locale && (
                    <div className="flex items-center rounded-full border border-gray-200 p-0.5 text-xs font-bold mr-2">
                        <Link
                            href={localizedHref("en")}
                            className={`px-2.5 py-1 rounded-full transition-colors ${locale === "en" ? "bg-[#1E3A8A] text-white" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            EN
                        </Link>
                        <Link
                            href={localizedHref("fr")}
                            className={`px-2.5 py-1 rounded-full transition-colors ${locale === "fr" ? "bg-[#1E3A8A] text-white" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            FR
                        </Link>
                    </div>
                )}

                {showLogout && (
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-xl font-bold transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                )}
            </div>
        </header>
    );
}