"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Loader2,
    Sparkles,
    RotateCcw,
    X
} from "lucide-react";
import { aiSearchAction, type ToolResultPayload } from "./actions";
import { ResultCards } from "./ai-result-display";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    results?: ToolResultPayload[];
    error?: boolean;
}

export default function AiSearchBar() {
    const t = useTranslations("adminSearch");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const threadRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading]);

    // Close the floating panel on outside click, so it never disturbs the
    // rest of the page — it only ever overlays, never pushes content down.
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setPanelOpen(false);
            }
        }
        if (panelOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [panelOpen]);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q || loading) return;

        setPanelOpen(true);
        // Every new search replaces the previous one — this behaves like a
        // normal search bar, not an ongoing chat. No prior history is sent
        // either, since there's nothing before this question to continue.
        setMessages([{ role: "user", content: q }]);
        setQuery("");
        setLoading(true);

        const result = await aiSearchAction(q, []);
        setLoading(false);

        if (result.error) {
            setMessages((prev) => [...prev, { role: "assistant", content: result.error!, error: true }]);
        } else {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: result.answer || t("noAnswer"), results: result.results }
            ]);
        }
    }

    function handleReset() {
        setMessages([]);
        setQuery("");
        setPanelOpen(false);
    }

    return (
        <div ref={containerRef} className="relative w-full max-w-3xl">
            <form onSubmit={handleSearch} className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => messages.length > 0 && setPanelOpen(true)}
                    placeholder={t("placeholder")}
                    className="pl-11 pr-24 h-12 rounded-2xl"
                    disabled={loading}
                />
                <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={handleReset}
                            title={t("thread.newSearchTooltip")}
                            className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    )}
                    <Button type="submit" disabled={loading} className="h-9 rounded-xl bg-[#1E3A8A]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
            </form>

            {/* Floating overlay — never affects the layout below it */}
            {panelOpen && messages.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t("panelLabel")}</span>
                        <button
                            type="button"
                            onClick={() => setPanelOpen(false)}
                            className="h-7 w-7 flex items-center justify-center text-gray-300 hover:text-gray-600 rounded-lg"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div ref={threadRef} className="max-h-[420px] overflow-y-auto space-y-4 pr-1">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                {m.role === "user" ? (
                                    <div className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm font-semibold max-w-[80%]">
                                        {m.content}
                                    </div>
                                ) : (
                                    <div className="max-w-[90%] w-full">
                                        <div className="flex items-start gap-2">
                                            <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                                            </div>
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm ${
                                                    m.error
                                                        ? "bg-red-50 text-red-700 border border-red-100"
                                                        : "bg-gray-50 text-gray-800 border border-gray-100"
                                                }`}
                                            >
                                                {m.content}
                                            </div>
                                        </div>
                                        {m.results && m.results.length > 0 && (
                                            <div className="pl-9">
                                                <ResultCards results={m.results} t={t} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2 pl-9 text-xs text-gray-400 font-semibold">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("thread.searching")}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}