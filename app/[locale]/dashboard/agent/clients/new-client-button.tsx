"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { createClientAction } from "./actions";

export default function NewClientButton({ isAgent }: { isAgent: boolean }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    function handleCreate(formData: FormData) {
        setError("");
        startTransition(async () => {
            const result = await createClientAction(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setOpen(false);
                formRef.current?.reset();
                window.location.reload();
            }
        });
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="h-12 px-6 gap-2 bg-[#1E3A8A] text-white hover:bg-blue-900 font-extrabold rounded-md"
            >
                <UserPlus className="h-5 w-5" /> New Client
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-[#1E3A8A]">New Client</DialogTitle>
                        <DialogDescription>
                            {isAgent
                                ? "This client will be assigned to you automatically."
                                : "This client will be created unassigned — assign an agent from the client list afterward."}
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
                            <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form ref={formRef} action={handleCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-800">Full name</label>
                            <Input name="name" required disabled={isPending} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-800">Email</label>
                            <Input name="email" type="email" required disabled={isPending} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-800">Temporary password</label>
                            <Input name="password" type="password" required minLength={8} disabled={isPending} />
                            <p className="text-xs text-gray-400">Share this with the client so they can sign in.</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold h-11 rounded-xl"
                        >
                            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Client"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}