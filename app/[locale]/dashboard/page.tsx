"use client";

import { useEffect } from "react";
import { useRouter as useLocaleRouter } from "@/i18n/routing";
import { useRouter as useNativeRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
    const router = useLocaleRouter();
    const nativeRouter = useNativeRouter();
    const { data: session, isPending } = useSession();
    const t = useTranslations("common");

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
                // /admin lives outside the [locale] route tree, so it must
                // NOT go through the locale-prefixing router.
                nativeRouter.push("/admin/dashboard");
            } else if (role === "agent") {
                router.push("/dashboard/agent");
            } else {
                router.push("/dashboard/client");
            }
        }
    }, [session, isPending, router, nativeRouter]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)] mx-auto" />
                <p className="mt-4 text-gray-500">{t("redirectingToDashboard")}</p>
            </div>
        </div>
    );
}