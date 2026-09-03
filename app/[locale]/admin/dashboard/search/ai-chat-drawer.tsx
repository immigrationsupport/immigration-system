"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    Send,
    Loader2,
    X,
    Trash2,
    Bot,
    User as UserIcon,
    ChevronDown,
    MessageSquare,
    CornerDownLeft,
    CheckCircle2
} from "lucide-react";
import { aiSearchAction, type ToolResultPayload, type ChatTurn } from "./actions";
import { ResultCards } from "./ai-result-display";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    results?: ToolResultPayload[];
    error?: boolean;
    timestamp: number;
}

export default function AiChatDrawer() {
    const t = useTranslations("adminSearch");
    const { data: session } = useSession();
    const userId = session?.user?.id || "admin";
    const storageKey = `immi_admin_ai_chat_v1_${userId}`;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load persisted chat history from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setMessages(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load chat history:", e);
        } finally {
            setIsInitialized(true);
        }
    }, [storageKey]);

    // Save chat history to localStorage whenever messages change
    useEffect(() => {
        if (!isInitialized) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } catch (e) {
            console.error("Failed to save chat history:", e);
        }
    }, [messages, isInitialized, storageKey]);

    // Scroll to bottom smoothly when new messages arrive or loading changes
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading, isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleSendMessage = async (queryText?: string) => {
        const text = (queryText || input).trim();
        if (!text || loading) return;

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}-user`,
            role: "user",
            content: text,
            timestamp: Date.now()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        // Prepare multi-turn history from previous messages (up to last 10 turns)
        const history: ChatTurn[] = updatedMessages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content
        }));

        try {
            const result = await aiSearchAction(text, history);

            if (result.error) {
                const errorMsg: ChatMessage = {
                    id: `msg-${Date.now()}-assistant`,
                    role: "assistant",
                    content: result.error,
                    error: true,
                    timestamp: Date.now()
                };
                setMessages((prev) => [...prev, errorMsg]);
            } else {
                const assistantMsg: ChatMessage = {
                    id: `msg-${Date.now()}-assistant`,
                    role: "assistant",
                    content: result.answer || t("noAnswer"),
                    results: result.results,
                    timestamp: Date.now()
                };
                setMessages((prev) => [...prev, assistantMsg]);
            }
        } catch (e) {
            const errorMsg: ChatMessage = {
                id: `msg-${Date.now()}-assistant`,
                role: "assistant",
                content: "An unexpected error occurred while communicating with the assistant.",
                error: true,
                timestamp: Date.now()
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = () => {
        setMessages([]);
        try {
            localStorage.removeItem(storageKey);
        } catch (e) {
            console.error("Failed to clear chat history:", e);
        }
        setConfirmClear(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating AI Chat Trigger Button at bottom-right */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-[#1E3A8A] to-blue-600 hover:from-blue-900 hover:to-indigo-700 text-white font-extrabold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 group border border-blue-400/30"
                    title={t("chat.tooltip", { defaultValue: "Chat with AI Assistant" })}
                >
                    <div className="relative">
                        <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                    </div>
                    <span className="text-sm tracking-wide">
                        {t("chat.buttonLabel", { defaultValue: "AI Chat" })}
                    </span>
                </button>
            )}

            {/* Persistent AI Chat Modal / Drawer Widget */}
            {isOpen && (
                <div className="fixed bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[500px] md:w-[560px] h-[640px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
                    {/* Header */}
                    <div className="px-5 py-4 bg-[#1E3A8A] text-white flex items-center justify-between shrink-0 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-extrabold text-base tracking-tight">
                                        {t("chat.title", { defaultValue: "AI Assistant Chat" })}
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-widest">
                                        Online
                                    </span>
                                </div>
                                <p className="text-xs text-blue-200 font-medium flex items-center gap-1.5 mt-0.5">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                    {t("chat.statusSaved", { defaultValue: "Chat history saved" })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <div className="relative">
                                    {confirmClear ? (
                                        <div className="flex items-center gap-1 bg-red-600/90 rounded-xl p-1 text-xs">
                                            <button
                                                onClick={handleClearHistory}
                                                className="px-2 py-1 font-bold bg-white text-red-700 rounded-lg hover:bg-red-50"
                                            >
                                                Clear
                                            </button>
                                            <button
                                                onClick={() => setConfirmClear(false)}
                                                className="p-1 hover:bg-white/20 rounded-lg"
                                            >
                                                <X className="h-3.5 w-3.5 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setConfirmClear(true)}
                                            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-blue-200 hover:text-white"
                                            title={t("chat.clearHistory", { defaultValue: "Clear conversation" })}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-blue-200 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                                <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center text-[#1E3A8A] border border-blue-100 shadow-sm">
                                    <Bot className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="space-y-1 max-w-sm">
                                    <h4 className="font-extrabold text-gray-900 text-base">
                                        {t("chat.emptyStateTitle", { defaultValue: "How can I help you today?" })}
                                    </h4>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {t("chat.emptyStateSubtitle", {
                                            defaultValue:
                                                "Ask questions about clients, agents, applications, or how to use the dashboard. Your conversation is saved automatically."
                                        })}
                                    </p>
                                </div>

                                {/* Prompt Suggestions */}
                                <div className="w-full max-w-md space-y-2 pt-2">
                                    {[
                                        t("chat.prompt1", { defaultValue: "How do I create a new workflow?" }),
                                        t("chat.prompt2", { defaultValue: "Find all pending applications" }),
                                        t("chat.prompt3", { defaultValue: "List all active clients" }),
                                        t("chat.prompt4", { defaultValue: "Show agents and their assigned clients" })
                                    ].map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(prompt)}
                                            className="w-full text-left text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700 transition-all shadow-2xs hover:shadow-xs flex items-center justify-between group"
                                        >
                                            <span className="truncate">{prompt}</span>
                                            <CornerDownLeft className="h-3 w-3 text-gray-400 group-hover:text-blue-600 shrink-0 ml-2" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {m.role === "user" ? (
                                        <div className="max-w-[85%] bg-[#1E3A8A] text-white px-4 py-3 rounded-2xl rounded-tr-sm text-xs font-medium shadow-sm leading-relaxed whitespace-pre-wrap">
                                            {m.content}
                                        </div>
                                    ) : (
                                        <div className="max-w-[92%] w-full space-y-2">
                                            <div className="flex items-start gap-2.5">
                                                <div className="h-7 w-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 text-[#1E3A8A]">
                                                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                                                </div>
                                                <div
                                                    className={`px-4 py-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed ${
                                                        m.error
                                                            ? "bg-red-50 text-red-800 border border-red-200"
                                                            : "bg-white text-gray-800 border border-gray-200 shadow-2xs"
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                                </div>
                                            </div>

                                            {m.results && m.results.length > 0 && (
                                                <div className="pl-9 w-full">
                                                    <ResultCards results={m.results} t={t} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex items-center gap-2.5 pl-9 text-xs text-gray-500 font-semibold py-1">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                <span>{t("chat.searching", { defaultValue: "AI is thinking..." })}</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Footer */}
                    <div className="p-3 bg-white border-t border-gray-200 shrink-0">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="relative flex items-center gap-2"
                        >
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t("chat.inputPlaceholder", { defaultValue: "Ask the AI assistant anything..." })}
                                disabled={loading}
                                className="w-full resize-none py-3 pl-4 pr-12 text-xs bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-2xl outline-none transition-all placeholder:text-gray-400 max-h-24"
                            />
                            <Button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="absolute right-1.5 h-8 w-8 p-0 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white disabled:opacity-40 transition-all shadow-sm flex items-center justify-center shrink-0"
                            >
                                {loading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Send className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
