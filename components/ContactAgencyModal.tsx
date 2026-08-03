"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { contactAction } from "@/lib/resend";

/**
 * "Contact Agency" popup.
 * Opened from the Navbar (or anywhere else) instead of navigating to a
 * separate /contact page. Submits straight to the Resend-powered
 * contactAction server action.
 */
export default function ContactAgencyModal({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations("contact");
    const tForm = useTranslations("contact.form");

    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    function handleSubmit(formData: FormData) {
        setStatus("idle");
        setErrorMessage("");
        startTransition(async () => {
            const result = await contactAction(formData);
            if (result?.error) {
                setStatus("error");
                setErrorMessage(result.error);
            } else {
                setStatus("success");
                formRef.current?.reset();
            }
        });
    }

    // Reset the form's state whenever the modal is closed, so the next time
    // it's opened it starts fresh.
    function handleOpenChange(next: boolean) {
        if (!next) {
            setStatus("idle");
            setErrorMessage("");
        }
        onOpenChange(next);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                {status === "success" ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle className="text-emerald-600 w-8 h-8" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{tForm("successTitle")}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            {tForm("successMessage")}
                        </p>
                        <Button
                            onClick={() => setStatus("idle")}
                            className="bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold px-8 rounded-xl"
                        >
                            {tForm("submitAnother")}
                        </Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-[#1E3A8A]">
                                {t("pageTitle")}
                            </DialogTitle>
                            <DialogDescription>{t("pageSubtitle")}</DialogDescription>
                        </DialogHeader>

                        {status === "error" && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
                                <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                                <span>{errorMessage || tForm("error")}</span>
                            </div>
                        )}

                        <form ref={formRef} action={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="fullName" className="text-sm font-semibold text-gray-800">
                                    {tForm("fullName")}
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    disabled={isPending}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] disabled:bg-gray-50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-sm font-semibold text-gray-800">
                                    {tForm("email")}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    disabled={isPending}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] disabled:bg-gray-50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="phone" className="text-sm font-semibold text-gray-800">
                                    {tForm("phone")}
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    disabled={isPending}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] disabled:bg-gray-50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="message" className="text-sm font-semibold text-gray-800">
                                    {tForm("message")}
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={4}
                                    maxLength={1000}
                                    placeholder={tForm("messagePlaceholder")}
                                    disabled={isPending}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] disabled:bg-gray-50 resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold h-11 rounded-xl"
                            >
                                {isPending ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                    <>
                                        {tForm("send")}
                                        <Send className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}