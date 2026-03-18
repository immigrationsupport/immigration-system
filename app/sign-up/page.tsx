"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Validation: Empty check
        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        // Validation: Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // Validation: Password match
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Validation: Password length
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);

        try {
            const res = await (signUp.email as any)({
                name,
                email,
                password,
            });

            if (res.error) {
                console.error("AUTH ERROR RESPONSE:", res.error);
                setError(res.error.message || "Failed to create account.");
                setLoading(false);
            } else {
                // Let middleware handle the role-based redirection 
                router.push("/dashboard");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-gray-100 p-8 relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Register    </h1>
                        <p className="mt-2 text-sm text-gray-500">Create your account to get started.</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm flex items-center">
                            <span className="block sm:inline font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                maxLength={70}
                                placeholder="Enter your full name"
                                required
                                disabled={loading}
                                className="block  truncate w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                maxLength={60}
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-1">Phone</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                maxLength={15}
                                placeholder="Enter your phone number"
                                disabled={loading}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" title="passwordToggle" className="block text-sm font-semibold text-gray-800 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    required
                                    minLength={8}
                                    disabled={loading}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500 pr-10"
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

                        <div>
                            <label htmlFor="confirmPassword" object-title="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    required
                                    disabled={loading}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-gray-900 focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500 pr-10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-2.5 px-4 rounded-sm shadow-sm text-sm font-medium text-white bg-[#1E3A8A] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                 type="button"
                                 disabled={loading}
                                 onClick={async () => {
                                     setLoading(true);
                                     try {
                                         await signIn.social({
                                             provider: "google",
                                             callbackURL: "/dashboard"
                                         });
                                     } catch (err) {
                                         setLoading(false);
                                     }
                                 }}
                                 className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-sm shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                             >
                                 <svg className="h-4 w-4 mr-2" aria-hidden="true" viewBox="0 0 24 24">
                                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                 </svg>
                                 Sign Up with Google
                             </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="font-semibold text-[#1E3A8A] hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}