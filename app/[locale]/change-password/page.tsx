"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { changePasswordAction } from "./actions";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    function handleSubmit(formData: FormData) {
        setError("");
        startTransition(async () => {
            const result = await changePasswordAction(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <KeyRound className="h-6 w-6 text-[#1E3A8A]" />
                    </div>
                    <h1 className="text-xl font-black text-[#1E3A8A]">Set your password</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        For your security, you must set your own password before continuing.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                        <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-800">Temporary password</label>
                        <Input name="currentPassword" type="password" required disabled={isPending} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-800">New password</label>
                        <Input name="newPassword" type="password" required minLength={8} disabled={isPending} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-800">Confirm new password</label>
                        <Input name="confirmPassword" type="password" required minLength={8} disabled={isPending} />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold h-11 rounded-xl"
                    >
                        {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Set password and continue"}
                    </Button>
                </form>
            </div>
        </div>
    );
}