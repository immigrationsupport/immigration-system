import React from "react";
import prisma from "@/lib/prisma";
import { AlertCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ResetPasswordForm from "./reset-password-form";

export const dynamic = "force-dynamic";

const RESET_TOKEN_PREFIX = "password-reset:";

export default async function ResetPasswordPage({
    params,
}: {
    params: Promise<{ token: string; locale: string }>;
}) {
    const { token, locale } = await params;
    const t = await getTranslations({ locale, namespace: "resetPassword" });

    const verification = await prisma.verification.findFirst({
        where: { identifier: `${RESET_TOKEN_PREFIX}${token}` },
    });

    const isValid = !!verification && verification.expiresAt > new Date();

    let agencyName: string | null = null;
    if (isValid && verification) {
        const user = await prisma.user.findUnique({
            where: { id: verification.value },
            select: { agency: { select: { name: true } } },
        });
        agencyName = user?.agency?.name || null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-gray-100 p-8 relative z-10">
                    <div className="text-center mb-8">
                        {agencyName && (
                            <p className="text-sm font-bold uppercase tracking-wide text-[#1E3A8A] mb-2">{agencyName}</p>
                        )}
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {t("title")}
                        </h1>
                        {isValid && (
                            <p className="mt-2 text-sm text-gray-500">
                                {t("subtitle")}
                            </p>
                        )}
                    </div>

                    {isValid ? (
                        <ResetPasswordForm token={token} locale={locale} />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-sm text-sm flex items-start gap-3">
                                <AlertCircle className="shrink-0 h-5 w-5 mt-0.5" />
                                <span className="font-medium">{t("invalidTokenMessage")}</span>
                            </div>
                            <a
                                href={`/${locale}/forgot-password`}
                                className="block text-center w-full py-2.5 px-4 rounded-sm shadow-sm text-sm font-medium text-white bg-[#1E3A8A] hover:bg-blue-900 transition-colors"
                            >
                                {t("requestNewLink")}
                            </a>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <a href={`/${locale}/sign-in`} className="text-sm font-semibold text-[#1E3A8A] hover:underline">
                            {t("backToSignIn")}
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}