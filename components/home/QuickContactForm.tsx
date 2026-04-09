"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickContactForm() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [form, setForm] = useState({ fullName: "", email: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to send message.");

            setStatus("success");
            setForm({ fullName: "", email: "", message: "" });
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "Failed to send message. Please try again.");
        }
    };

    if (status === "success") {
        return (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                    <CheckCircle className="text-white w-8 h-8" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Message Received!</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                    Our team has received your inquiry and will get back to you within 24 hours.
                </p>
                <Button 
                    onClick={() => setStatus("idle")}
                    className="bg-white text-[#1E3A8A] hover:bg-white/90 font-bold px-8 rounded-xl"
                >
                    Send Another
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
            {/* Visual background element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-400/30 transition-all duration-700" />
            
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-6 bg-white rounded-full" />
                Quick Inquiry
            </h3>

            {status === "error" && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-100 text-xs animate-in slide-in-from-top-2">
                    <AlertCircle className="shrink-0 w-4 h-4" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <textarea
                        placeholder="How can we help you?"
                        required
                        rows={3}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
                    />
                </div>

                <Button 
                    type="submit" 
                    disabled={status === "submitting"}
                    className="w-full bg-white text-[#1E3A8A] hover:bg-blue-50 font-black h-12 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                    {status === "submitting" ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                        <>
                            Send Message
                            <Send className="ml-2 w-4 h-4" />
                        </>
                    )}
                </Button>
            </div>
            
            <p className="mt-4 text-[10px] text-white/40 text-center uppercase tracking-widest font-bold">
                Response within 24 business hours
            </p>
        </form>
    );
}
