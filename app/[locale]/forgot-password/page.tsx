"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { requestPasswordResetAction, resetPasswordWithCodeAction } from "./actions";

export default function ForgotPasswordPage() {
    const t = useTranslations("forgotPassword");
    const locale = useLocale();
    const router = useRouter();

    const [step, setStep] = useState<"email" | "code" | "done">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSendCode(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await requestPasswordResetAction(email, locale);

        setLoading(false);
        if (result.error) {
            setError(result.error);
        } else {
            setStep("code");
        }
    }

    async function handleResendCode() {
        setError(null);
        setLoading(true);
        const result = await requestPasswordResetAction(email, locale);
        setLoading(false);
        if (result.error) {
            setError(result.error);
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError(t("errorMismatch"));
            return;
        }
        if (newPassword.length < 8) {
            setError(t("errorTooShort"));
            return;
        }

        setLoading(true);
        const result = await resetPasswordWithCodeAction(email, code, newPassword, confirmPassword, locale);
        setLoading(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        setStep("done");
        setTimeout(() => {
            router.push(`/${locale}/sign-in`);
        }, 2500);
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-gray-100 p-8 relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {t("title")}
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            {step === "email" ? t("subtitle") : t("codeStepSubtitle")}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm flex items-start gap-2">
                            <AlertCircle className="shrink-0 h-4 w-4 mt-0.5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {step === "done" ? (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-4 rounded-sm text-sm flex items-start gap-3">
                            <CheckCircle2 className="shrink-0 h-5 w-5 mt-0.5" />
                            <span className="font-medium">{t("successMessage")}</span>
                        </div>
                    ) : step === "email" ? (
                        <form onSubmit={handleSendCode} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
                                    {t("emailLabel")}
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t("emailPlaceholder")}
                                        required
                                        disabled={loading}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500 pl-9"
                                    />
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-2.5 px-4 rounded-sm shadow-sm text-sm font-medium text-white bg-[#1E3A8A] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("sendButton")}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <p className="text-sm text-gray-600 -mt-2">{t("codeSentMessage", { email })}</p>

                            <div>
                                <label htmlFor="code" className="block text-sm font-semibold text-gray-800 mb-1">
                                    {t("codeLabel")}
                                </label>
                                <div className="relative">
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        inputMode="numeric"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder={t("codePlaceholder")}
                                        required
                                        maxLength={6}
                                        disabled={loading}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 tracking-widest text-center font-semibold focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500 pl-9"
                                    />
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-800 mb-1">
                                    {t("newPasswordLabel")}
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        disabled={loading}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500 pl-9"
                                    />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-1">
                                    {t("confirmPasswordLabel")}
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        disabled={loading}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500 pl-9"
                                    />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-2.5 px-4 rounded-sm shadow-sm text-sm font-medium text-white bg-[#1E3A8A] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("resetButton")}
                            </button>

                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={loading}
                                className="w-full text-center text-sm font-semibold text-[#1E3A8A] hover:underline disabled:opacity-50"
                            >
                                {t("resendCode")}
                            </button>
                        </form>
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