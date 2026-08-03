"use client";

import { Link } from "@/i18n/routing";
import { UserX } from "lucide-react";

/**
 * Public self-registration has been disabled. Clients are now created
 * exclusively by their agent or admin (Option B from the multi-tenant
 * discussion) — a public /sign-up with no way to know which agency a
 * new client belongs to would create orphaned accounts.
 */
export default function SignUpPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-gray-100 p-8 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <UserX className="h-6 w-6 text-[#1E3A8A]" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                        Account creation is by invitation only
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Your agent or agency administrator creates your account for you. If you're
                        expecting access, please contact your agency directly.
                    </p>
                    <Link
                        href="/sign-in"
                        className="mt-6 inline-block font-semibold text-[#1E3A8A] hover:underline text-sm"
                    >
                        Back to sign in
                    </Link>
                </div>
            </main>
        </div>
    );
}