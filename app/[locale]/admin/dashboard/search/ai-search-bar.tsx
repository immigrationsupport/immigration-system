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
    User,
    Briefcase,
    FileText,
    Mail,
    Phone,
    Globe,
    ArrowUpRight,
    X
} from "lucide-react";
import { aiSearchAction, type ToolResultPayload } from "./actions";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    results?: ToolResultPayload[];
    error?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700 border-green-100",
    PENDING: "bg-amber-50 text-amber-700 border-amber-100",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-100",
    APPROVED: "bg-green-50 text-green-700 border-green-100",
    REJECTED: "bg-red-50 text-red-700 border-red-100",
    COMPLETED: "bg-green-50 text-green-700 border-green-100",
    CANCELLED: "bg-gray-50 text-gray-500 border-gray-100",
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-100",
    IN_REVIEW: "bg-amber-50 text-amber-700 border-amber-100",
    VALIDATED: "bg-green-50 text-green-700 border-green-100",
    MODIFICATION_REQUESTED: "bg-amber-50 text-amber-700 border-amber-100"
};

function StatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] || "bg-gray-50 text-gray-600 border-gray-100";
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${style}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

function ClientCard({ client, t }: { client: any; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1E3A8A] font-black shrink-0">
                        {client.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-sm">{client.name}</p>
                        {client.agent?.name && <p className="text-xs text-gray-400">{t("thread.agentPrefix")}{client.agent.name}</p>}
                    </div>
                </div>
                {client.isSuspended ? <StatusBadge status="SUSPENDED" /> : client.status && <StatusBadge status={client.status} />}
            </div>
            <div className="space-y-1.5 text-xs text-gray-600">
                {client.email && (
                    <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-300" /> {client.email}
                    </div>
                )}
                {client.phoneNumber && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-300" /> {client.phoneNumber}
                    </div>
                )}
            </div>
            {client.applications && client.applications.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t("thread.applicationsLabel")}</p>
                    {client.applications.map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-700 flex items-center gap-1.5">
                                <Globe className="h-3 w-3 text-gray-300" /> {app.country}
                            </span>
                            <StatusBadge status={app.status} />
                        </div>
                    ))}
                </div>
            )}
            <Link
                href="/admin/dashboard/clients"
                className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline"
            >
                {t("openInClients")} <ArrowUpRight className="h-3 w-3" />
            </Link>
        </div>
    );
}

function AgentCard({ agent, t }: { agent: any; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-black shrink-0">
                        {agent.name?.[0]?.toUpperCase() || <Briefcase className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-sm">{agent.name}</p>
                        <p className="text-xs text-gray-400">{agent.email}</p>
                    </div>
                </div>
                {agent.isSuspended && <StatusBadge status="SUSPENDED" />}
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">
                {t("thread.clientsAssigned", { count: agent.assignedClients?.length || 0 })}
            </p>
            <Link
                href="/admin/dashboard/agents"
                className="mt-2 flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline"
            >
                {t("openInAgents")} <ArrowUpRight className="h-3 w-3" />
            </Link>
        </div>
    );
}

function ApplicationCard({ app, t }: { app: any; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E3A8A] shrink-0">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-sm">{app.client?.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Globe className="h-3 w-3" /> {app.country}
                        </p>
                    </div>
                </div>
                <StatusBadge status={app.status} />
            </div>
            {app.agent?.name && <p className="text-xs text-gray-400 mt-2">{t("thread.agentPrefix")}{app.agent.name}</p>}
            {app.steps && app.steps.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                    {t("thread.stepsCompleted", {
                        completed: app.steps.filter((s: any) => s.status === "APPROVED").length,
                        total: app.steps.length
                    })}
                </p>
            )}
            <Link
                href="/admin/dashboard/applications"
                className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline"
            >
                {t("openInApplications")} <ArrowUpRight className="h-3 w-3" />
            </Link>
        </div>
    );
}

function ResultCards({ results, t }: { results: ToolResultPayload[]; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="mt-3 space-y-3">
            {results.map((r, i) => {
                if (!r.result || (Array.isArray(r.result) && r.result.length === 0)) return null;

                if (r.tool === "search_clients" && Array.isArray(r.result)) {
                    return (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {r.result.map((c: any) => <ClientCard key={c.id} client={c} t={t} />)}
                        </div>
                    );
                }
                if (r.tool === "get_client_details" && r.result) {
                    return <ClientCard key={i} client={r.result} t={t} />;
                }
                if (r.tool === "search_agents" && Array.isArray(r.result)) {
                    return (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {r.result.map((a: any) => <AgentCard key={a.id} agent={a} t={t} />)}
                        </div>
                    );
                }
                if (r.tool === "search_applications" && Array.isArray(r.result)) {
                    return (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {r.result.map((a: any) => <ApplicationCard key={a.id} app={a} t={t} />)}
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
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