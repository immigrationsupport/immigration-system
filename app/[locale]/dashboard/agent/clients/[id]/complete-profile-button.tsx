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
import { Pencil, AlertCircle, Loader2 } from "lucide-react";
import { completeClientProfileAction } from "./actions";

interface ClientProfileDefaults {
    dateOfBirth?: string | null;
    nationality?: string | null;
    maritalStatus?: string | null;
    numberOfChildren?: number | null;
    address?: string | null;
    phoneNumber?: string | null;
}

export default function CompleteProfileButton({
    clientId,
    defaults,
}: {
    clientId: string;
    defaults: ClientProfileDefaults;
}) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    function handleSubmit(formData: FormData) {
        setError("");
        startTransition(async () => {
            const result = await completeClientProfileAction(clientId, formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setOpen(false);
                window.location.reload();
            }
        });
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="gap-1.5 font-bold text-xs"
            >
                <Pencil className="h-3.5 w-3.5" /> Complete Profile
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-[#1E3A8A]">Complete Client Profile</DialogTitle>
                        <DialogDescription>
                            Fill this in on the client's behalf — they will only ever see the result.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
                            <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form ref={formRef} action={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-800">Date of birth</label>
                                <Input
                                    name="dateOfBirth"
                                    type="date"
                                    required
                                    disabled={isPending}
                                    defaultValue={defaults.dateOfBirth ? defaults.dateOfBirth.slice(0, 10) : ""}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-800">Nationality</label>
                                <Input
                                    name="nationality"
                                    required
                                    disabled={isPending}
                                    defaultValue={defaults.nationality || ""}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-800">Marital status</label>
                                <select
                                    name="maritalStatus"
                                    required
                                    disabled={isPending}
                                    defaultValue={defaults.maritalStatus || ""}
                                    className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                                >
                                    <option value="" disabled>Select...</option>
                                    <option value="SINGLE">Single</option>
                                    <option value="MARRIED">Married</option>
                                    <option value="DIVORCED">Divorced</option>
                                    <option value="WIDOWED">Widowed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-800">Number of children</label>
                                <Input
                                    name="numberOfChildren"
                                    type="number"
                                    min={0}
                                    disabled={isPending}
                                    defaultValue={defaults.numberOfChildren ?? 0}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-800">Phone number</label>
                            <Input
                                name="phoneNumber"
                                type="tel"
                                disabled={isPending}
                                defaultValue={defaults.phoneNumber || ""}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-800">Address</label>
                            <Input
                                name="address"
                                required
                                disabled={isPending}
                                defaultValue={defaults.address || ""}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold h-11 rounded-xl"
                        >
                            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Profile"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}