"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { role } from "better-auth/plugins";
import { property } from "better-auth";

export default function AdminRegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation: Empty check
        if (!name || !email || !password) {
            setError("All fields are required.");
            return;
        }

        // Validation: Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // Validation: Password length
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);

        try {
    const res = await signUp.email({
        name,
        email,
        password,
    role: "ADMIN",
  
        
  
    });

    console.log("SIGNUP RESPONSE:", res);

    if (res?.error) {
        setError(res.error.message || "Registration failed");
        return;
    }

    router.push("/admin/login");

} catch (err) {
    console.error("CATCH ERROR:", err);
    setError("Unexpected error occurred.");
}
       
        finally {
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
                        Register Admin
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Create an administrator account.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Full Name
                        </label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="w-full"
                        />
                    </div>

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
                            placeholder="admin@example.com"
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
                            minLength={8}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white font-medium py-2.5 rounded hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: "#1E3A8A", borderRadius: "8px" }}
                    >
                        {loading ? "Creating..." : "Create Admin Account"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs font-medium text-gray-400">
                        Authorized configuration setup.
                    </p>
                </div>
            </div>
        </div>
    );
}
