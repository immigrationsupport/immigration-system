"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signIn.email({
                email,
                password,
            }, {
                onSuccess: () => {
                    router.push("/dashboard");
                },
                onError: (ctx) => {
                    setError(ctx.error.message || "Invalid credentials");
                }
            });
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
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
                        Login
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Please sign in to access your dashboard.
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
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="staff@example.com"
                            required
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white font-medium py-2.5 rounded hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: "#1E3A8A", borderRadius: "8px" }}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs font-medium text-gray-400">
                        Authorized staff access only.
                    </p>
                </div>
            </div>
        </div>
    );
}
