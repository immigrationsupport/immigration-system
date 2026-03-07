"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!session && !isPending) {
            router.push("/sign-in");
            return;
        }

        if (session) {
            interface UserWithRole {
                role?: string;
                isSuspended?: boolean;
            }
            const user = session.user as UserWithRole;

            if (user.isSuspended) {
                // If suspended, don't allow dashboard access
                router.push("/sign-in?suspended=true");
                return;
            }

            const role = (user.role || "client").toLowerCase();

            if (role === "admin") {
                router.push("/admin/dashboard");
            } else if (role === "agent") {
                router.push("/dashboard/agent");
            } else {
                router.push("/dashboard/client");
            }
        }
    }, [session, isPending, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)] mx-auto" />
                <p className="mt-4 text-gray-500">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}