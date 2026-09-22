"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export interface HelpGuideStep {
    title: string;
    description: string;
}

export interface HelpGuideButtonProps {
    title: string;
    description?: string;
    steps: HelpGuideStep[];
    label?: string;
    className?: string;
}

/**
 * Small "?" help button that opens an in-app, numbered step-by-step guide.
 * Used to answer "how do I..." questions (create a client, create an
 * agent, assign a client to an agent) right where the action happens,
 * instead of sending the person to an external manual or video.
 */
export function HelpGuideButton({ title, description, steps, label, className }: HelpGuideButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                title={label || title}
                aria-label={label || title}
                className={
                    className ||
                    "h-9 w-9 rounded-full border border-blue-100 bg-blue-50 text-[#1E3A8A] flex items-center justify-center hover:bg-blue-100 transition-all shrink-0"
                }
            >
                <HelpCircle className="h-4 w-4" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg rounded-2xl border-none shadow-2xl p-6">
                    <DialogHeader className="space-y-2">
                        <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-xl font-black text-center text-gray-900">
                            {title}
                        </DialogTitle>
                        {description && (
                            <DialogDescription className="text-center text-gray-500 text-sm font-medium">
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <ol className="space-y-4 pt-2">
                        {steps.map((step, index) => (
                            <li key={index} className="flex gap-3">
                                <span className="h-7 w-7 rounded-full bg-[#1E3A8A] text-white text-xs font-black flex items-center justify-center shrink-0">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{step.title}</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                                        {step.description}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </DialogContent>
            </Dialog>
        </>
    );
}