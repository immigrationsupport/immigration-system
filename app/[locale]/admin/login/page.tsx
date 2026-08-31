"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminLoginPage() {
    const t = useTranslations("adminAuth.login");
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signIn.email({
                email,
                password,
                rememberMe: true,
            }, {
                onSuccess: () => {
                    router.push("/admin/dashboard");
                },
                onError: (ctx) => {
                    setError(ctx.error.message || t("errorInvalidCredentials"));
                }
            });
        } catch (err: any) {
            setError(err.message || t("errorUnexpected"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div
                className="w-full max-w-md bg-white p-8"
                style={{
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    borderRadius: "8px"
                }}
            >
                <div className="text-center mb-8">
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{ color: "#1E3A8A" }}
                    >
                        {t("title")}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {t("subtitle")}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            {t("email")}
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("emailPlaceholder")}
                            required
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            {t("password")}
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white font-medium py-2.5 rounded hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: "#1E3A8A", borderRadius: "8px" }}
                    >
                        {loading ? t("signingIn") : t("signIn")}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs font-medium text-gray-400">
                        {t("footerNote")}
                    </p>
                </div>
            </div>
        </div>
    );
}