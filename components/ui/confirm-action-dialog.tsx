"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, AlertTriangle, Ban, Trash2, Loader2 } from "lucide-react";

export interface ConfirmActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmTargetName: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    variant?: "danger" | "warning";
    actionType?: "delete" | "suspend";
    isPending?: boolean;
    error?: string;
}

export function ConfirmActionDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmTargetName,
    confirmButtonText,
    cancelButtonText = "Cancel",
    variant = "danger",
    actionType = "delete",
    isPending = false,
    error,
}: ConfirmActionDialogProps) {
    const [typedName, setTypedName] = useState("");

    useEffect(() => {
        if (open) {
            setTypedName("");
        }
    }, [open]);

    const isMatch =
        typedName.trim().toLowerCase() ===
        confirmTargetName.trim().toLowerCase();

    const isDelete = actionType === "delete" || variant === "danger";

    const defaultConfirmText = isDelete ? "Delete" : "Suspend";

    return (
        <Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
            <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl overflow-hidden p-6">
                <DialogHeader className="space-y-3">
                    <div
                        className={`mx-auto h-12 w-12 rounded-2xl flex items-center justify-center ${
                            isDelete
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                        }`}
                    >
                        {isDelete ? (
                            <Trash2 className="h-6 w-6" />
                        ) : (
                            <Ban className="h-6 w-6" />
                        )}
                    </div>

                    <DialogTitle className="text-xl font-black text-center text-gray-900">
                        {title}
                    </DialogTitle>

                    <DialogDescription className="text-center text-gray-600 text-sm leading-relaxed">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 block">
                            Type <strong className="text-gray-900 select-all font-black">{confirmTargetName}</strong> to confirm:
                        </label>
                        <Input
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            placeholder={confirmTargetName}
                            disabled={isPending}
                            className="bg-white border-gray-300 font-semibold"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && isMatch && !isPending) {
                                    e.preventDefault();
                                    onConfirm();
                                }
                            }}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
                            <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => onOpenChange(false)}
                            className="flex-1 rounded-xl font-bold border-gray-200 hover:bg-gray-100"
                        >
                            {cancelButtonText}
                        </Button>
                        <Button
                            type="button"
                            disabled={!isMatch || isPending}
                            onClick={onConfirm}
                            className={`flex-1 rounded-xl font-black gap-1.5 shadow-md ${
                                isDelete
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-amber-600 hover:bg-amber-700 text-white"
                            }`}
                        >
                            {isPending ? (
                                <Loader2 className="animate-spin w-4 h-4 mr-1.5" />
                            ) : isDelete ? (
                                <Trash2 className="w-4 h-4 mr-1" />
                            ) : (
                                <Ban className="w-4 h-4 mr-1" />
                            )}
                            {confirmButtonText || defaultConfirmText}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
