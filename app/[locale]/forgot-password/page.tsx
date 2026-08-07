"use client";

import { useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { requestPasswordResetAction } from "./actions";

export default function ForgotPasswordPage() {
    const t = useTranslations("auth.signIn");
    const locale = useLocale();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await requestPasswordResetAction(email);

        setLoading(false);
        if (result.error) {
            setError(result.error);
        } else {
            setSent(true);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-gray-100 p-8 relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {locale === "fr" ? "Mot de passe oublié" : "Forgot password"}
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            {locale === "fr"
                                ? "Entrez votre e-mail pour recevoir un lien de réinitialisation."
                                : "Enter your email to receive a reset link."}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
                            <span className="block sm:inline font-medium">{error}</span>
                        </div>
                    )}

                    {sent ? (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-4 rounded-sm text-sm flex items-start gap-3">
                            <CheckCircle2 className="shrink-0 h-5 w-5 mt-0.5" />
                            <span className="font-medium">
                                {locale === "fr"
                                    ? "Si cet e-mail correspond à un compte, un lien de réinitialisation a été envoyé."
                                    : "If an account exists for this email, a password reset link has been sent."}
                            </span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">{t("email")}</label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={locale === "fr" ? "Entrez votre e-mail" : "Enter your email"}
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
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (locale === "fr" ? "Envoyer le lien" : "Send reset link")}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <a href="/sign-in" className="text-sm font-semibold text-[#1E3A8A] hover:underline">
                            {locale === "fr" ? "Retour à la connexion" : "Back to sign in"}
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}