"use client";

import { useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { changePasswordAction } from "@/app/[locale]/change-password/actions";

export default function ChangePasswordButton({ variant = "primary" }: { variant?: "primary" | "secondary" | "outline" | "ghost" }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    function handleSubmit(formData: FormData) {
        setError("");
        setSuccess(false);
        startTransition(async () => {
            const result = await changePasswordAction(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setSuccess(true);
            }
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                    setError("");
                    setSuccess(false);
                }
            }}
        >
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant={variant}
                    className={
                        variant === "primary"
                            ? "bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest px-8 h-14 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2"
                            : "font-black uppercase tracking-widest rounded-2xl flex items-center gap-2"
                    }
                >
                    <KeyRound size={18} /> Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] border-none shadow-2xl rounded-2xl">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                        <KeyRound className="h-6 w-6 text-[#1E3A8A]" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-900">Change Password</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                        Enter your current password and choose a new one.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-700 text-sm font-bold">
                        <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800">
                        <CheckCircle2 size={20} />
                        <span className="text-sm font-black uppercase tracking-tight">Password updated successfully</span>
                    </div>
                ) : (
                    <form action={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                            <Input name="currentPassword" type="password" required disabled={isPending} className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                            <Input name="newPassword" type="password" required minLength={8} disabled={isPending} className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <Input name="confirmPassword" type="password" required minLength={8} disabled={isPending} className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold" />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="font-bold text-gray-500 hover:bg-gray-50 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-[#1E3A8A] hover:bg-[#152a6a] text-white font-black rounded-xl px-8 shadow-lg shadow-blue-200"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}