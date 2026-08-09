"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { resetPasswordAction } from "./actions";

export default function ResetPasswordForm({ token, locale }: { token: string; locale: string }) {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await resetPasswordAction(token, newPassword, confirmPassword);

        setLoading(false);
        if (result.error) {
            setError(result.error);
            return;
        }

        setDone(true);
        setTimeout(() => {
            router.push(`/${locale}/sign-in`);
        }, 2500);
    }

    if (done) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-4 rounded-sm text-sm flex items-start gap-3">
                <CheckCircle2 className="shrink-0 h-5 w-5 mt-0.5" />
                <span className="font-medium">
                    {locale === "fr"
                        ? "Votre mot de passe a été réinitialisé. Redirection vers la connexion..."
                        : "Your password has been reset. Redirecting to sign in..."}
                </span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm flex items-start gap-2">
                    <AlertCircle className="shrink-0 h-4 w-4 mt-0.5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-800 mb-1">
                    {locale === "fr" ? "Nouveau mot de passe" : "New password"}
                </label>
                <div className="relative">
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={8}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500 pl-9"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-1">
                    {locale === "fr" ? "Confirmer le mot de passe" : "Confirm password"}
                </label>
                <div className="relative">
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={8}
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (locale === "fr" ? "Réinitialiser le mot de passe" : "Reset password")}
            </button>
        </form>
    );
}