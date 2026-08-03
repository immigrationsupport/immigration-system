"use client";

import { Bell, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface HeaderProps {
    title: string;
    onMenuClick?: () => void;
    showLogout?: boolean;
}

export function Header({ title, onMenuClick, showLogout = false }: HeaderProps) {
    const router = useRouter();
    const { data: session } = useSession();

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

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
            <div className="flex items-center gap-4">
                {onMenuClick && (
                    <Button variant="outline" className="md:hidden" onClick={onMenuClick}>
                        <Menu className="h-6 w-6" />
                    </Button>
                )}
                <h1 className="text-xl font-semibold text-gray-800 tracking-tight">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                

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
