"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    User,
    Briefcase,
    FileText,
    Mail,
    Phone,
    Globe,
    ArrowUpRight,
    Users
} from "lucide-react";
import type { ToolResultPayload } from "./actions";

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-gray-50 text-gray-500 border-gray-200",
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
    IN_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
    VALIDATED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MODIFICATION_REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
    SUSPENDED: "bg-red-50 text-red-700 border-red-200"
};

export function StatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] || "bg-gray-50 text-gray-600 border-gray-200";
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${style}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

export function ClientCard({ client, t }: { client: any; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1E3A8A] font-black shrink-0">
                        {client.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-sm">{client.name}</p>
                        {client.agent?.name && (
                            <p className="text-xs text-gray-400 font-medium">
                                {t("thread.agentPrefix")}{client.agent.name}
                            </p>
                        )}
                    </div>
                </div>
                {client.isSuspended ? (
                    <StatusBadge status="SUSPENDED" />
                ) : client.status ? (
                    <StatusBadge status={client.status} />
                ) : null}
            </div>
            <div className="space-y-1.5 text-xs text-gray-600">
                {client.email && (
                    <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{client.email}</span>
                    </div>
                )}
                {client.phoneNumber && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span>{client.phoneNumber}</span>
                    </div>
                )}
            </div>
            {client.applications && client.applications.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {t("thread.applicationsLabel")}
                    </p>
                    {client.applications.map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-700 flex items-center gap-1.5">
                                <Globe className="h-3 w-3 text-gray-400" /> {app.country}
                            </span>
                            <StatusBadge status={app.status} />
                        </div>
                    ))}
                </div>
            )}
            <Link
                href="/admin/dashboard/clients"
                className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1E3A8A] hover:underline"
            >
                <span>{t("openInClients")}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}

export function AgentCard({ agent, t }: { agent: any; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-black shrink-0">
                        {agent.name?.[0]?.toUpperCase() || <Briefcase className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-sm">{agent.name}</p>
                        <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                    </div>
                </div>
                {agent.isSuspended ? (
                    <StatusBadge status="SUSPENDED" />
                ) : (
                    <StatusBadge status="ACTIVE" />
                )}
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                {t("thread.clientsAssigned", { count: agent.assignedClients?.length || 0 })}
            </p>
            <Link
                href="/admin/dashboard/agents"
                className="mt-2 flex items-center justify-between text-xs font-bold text-[#1E3A8A] hover:underline"
            >
                <span>{t("openInAgents")}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}

export function ApplicationCard({ app, t }: { app: any; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
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
            {app.agent?.name && (
                <p className="text-xs text-gray-400 mt-2">
                    {t("thread.agentPrefix")}{app.agent.name}
                </p>
            )}
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
                className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1E3A8A] hover:underline"
            >
                <span>{t("openInApplications")}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}

/* =========================================================================
   TABLE VIEWS (Rendered when results count > 5 as requested by user)
   ========================================================================= */

function ClientResultsTable({ clients, t }: { clients: any[]; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#1E3A8A]" />
                    <span className="text-xs font-black text-[#1E3A8A] uppercase tracking-wider">
                        {clients.length} {t("table.applications", { defaultValue: "Clients" })}
                    </span>
                </div>
                <Link
                    href="/admin/dashboard/clients"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline"
                >
                    {t("openInClients")} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            </div>
            <div className="overflow-x-auto max-h-[320px]">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-100/90 text-gray-700 font-extrabold uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10">
                            <th className="px-3.5 py-2.5">{t("table.name", { defaultValue: "Name" })}</th>
                            <th className="px-3.5 py-2.5">{t("table.email", { defaultValue: "Email" })}</th>
                            <th className="px-3.5 py-2.5">{t("table.agent", { defaultValue: "Agent" })}</th>
                            <th className="px-3.5 py-2.5">{t("table.status", { defaultValue: "Status" })}</th>
                            <th className="px-3.5 py-2.5 text-right">{t("table.action", { defaultValue: "Manage" })}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-blue-50/40 transition-colors">
                                <td className="px-3.5 py-2.5 font-bold text-gray-900 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-[#1E3A8A]">
                                            {client.name?.[0]?.toUpperCase()}
                                        </div>
                                        <span>{client.name}</span>
                                    </div>
                                </td>
                                <td className="px-3.5 py-2.5 text-gray-600 truncate max-w-[160px]">
                                    {client.email || "-"}
                                </td>
                                <td className="px-3.5 py-2.5 text-gray-600 truncate max-w-[120px]">
                                    {client.agent?.name || (
                                        <span className="text-gray-400 italic">
                                            {t("table.unassigned", { defaultValue: "Unassigned" })}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3.5 py-2.5 whitespace-nowrap">
                                    {client.isSuspended ? (
                                        <StatusBadge status="SUSPENDED" />
                                    ) : client.status ? (
                                        <StatusBadge status={client.status} />
                                    ) : (
                                        <StatusBadge status="ACTIVE" />
                                    )}
                                </td>
                                <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                    <Link
                                        href="/admin/dashboard/clients"
                                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                        {t("manage", { defaultValue: "Manage" })} <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AgentResultsTable({ agents, t }: { agents: any[]; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#1E3A8A]" />
                    <span className="text-xs font-black text-[#1E3A8A] uppercase tracking-wider">
                        {agents.length} {t("openInAgents", { defaultValue: "Agents" })}
                    </span>
                </div>
                <Link
                    href="/admin/dashboard/agents"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline"
                >
                    {t("openInAgents")} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            </div>
            <div className="overflow-x-auto max-h-[320px]">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-100/90 text-gray-700 font-extrabold uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10">
                            <th className="px-3.5 py-2.5">{t("table.name", { defaultValue: "Name" })}</th>
                            <th className="px-3.5 py-2.5">{t("table.email", { defaultValue: "Email" })}</th>
                            <th className="px-3.5 py-2.5">{t("table.assignedClients", { defaultValue: "Clients" })}</th>
                            <th className="px-3.5 py-2.5">{t("table.status", { defaultValue: "Status" })}</th>
                            <th className="px-3.5 py-2.5 text-right">{t("table.action", { defaultValue: "Manage" })}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {agents.map((agent) => (
                            <tr key={agent.id} className="hover:bg-blue-50/40 transition-colors">
                                <td className="px-3.5 py-2.5 font-bold text-gray-900 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-700">
                                            {agent.name?.[0]?.toUpperCase()}
                                        </div>
                                        <span>{agent.name}</span>
                                    </div>
                                </td>
                                <td className="px-3.5 py-2.5 text-gray-600 truncate max-w-[160px]">
                                    {agent.email || "-"}
                                </td>
                                <td className="px-3.5 py-2.5 text-gray-600 font-bold">
                                    {agent.assignedClients?.length || 0}
                                </td>
                                <td className="px-3.5 py-2.5 whitespace-nowrap">
                                    {agent.isSuspended ? (
                                        <StatusBadge status="SUSPENDED" />
                                    ) : (
                                        <StatusBadge status="ACTIVE" />
                                    )}
                                </td>
                                <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                    <Link
                                        href="/admin/dashboard/agents"
                                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                        {t("manage", { defaultValue: "Manage" })} <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ApplicationResultsTable({ apps, t }: { apps: any[]; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#1E3A8A]" />
                    <span className="text-xs font-black text-[#1E3A8A] uppercase tracking-wider">
                        {apps.length} {t("openInApplications", { defaultValue: "Procedures" })}
                    </span>
                </div>
                <Link
                    href="/admin/dashboard/applications"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline"
                >
                    {t("openInApplications")} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
            </div>
            <div className="overflow-x-auto max-h-[320px]">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-100/90 text-gray-700 font-extrabold uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10">
                            <th className="px-3.5 py-2.5">{t("table.client", { defaultValue: "Client" })}</th>
                            <th className="px-3.5 py-2.5">{t("table.country", { defaultValue: "Country" })}</th>
                            <th className="px-3.5 py-2.5">{t("table.agent", { defaultValue: "Agent" })}</th>
                            <th className="px-3.5 py-2.5">{t("table.status", { defaultValue: "Status" })}</th>
                            <th className="px-3.5 py-2.5 text-right">{t("table.action", { defaultValue: "Manage" })}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {apps.map((app) => (
                            <tr key={app.id} className="hover:bg-blue-50/40 transition-colors">
                                <td className="px-3.5 py-2.5 font-bold text-gray-900 whitespace-nowrap">
                                    {app.client?.name || "-"}
                                </td>
                                <td className="px-3.5 py-2.5 text-gray-700 font-semibold flex items-center gap-1">
                                    <Globe className="h-3 w-3 text-gray-400" />
                                    <span>{app.country || "-"}</span>
                                </td>
                                <td className="px-3.5 py-2.5 text-gray-600 truncate max-w-[120px]">
                                    {app.agent?.name || (
                                        <span className="text-gray-400 italic">
                                            {t("table.unassigned", { defaultValue: "Unassigned" })}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3.5 py-2.5 whitespace-nowrap">
                                    <StatusBadge status={app.status} />
                                </td>
                                <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                    <Link
                                        href="/admin/dashboard/applications"
                                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                        {t("manage", { defaultValue: "Manage" })} <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function ResultCards({ results, t }: { results: ToolResultPayload[]; t: ReturnType<typeof useTranslations> }) {
    return (
        <div className="mt-3 space-y-3">
            {results.map((r, i) => {
                if (!r.result || (Array.isArray(r.result) && r.result.length === 0)) return null;

                if (r.tool === "search_clients" && Array.isArray(r.result)) {
                    // When more than 5 results are returned, display as a clean table with Manage links!
                    if (r.result.length > 5) {
                        return <ClientResultsTable key={i} clients={r.result} t={t} />;
                    }
                    return (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {r.result.map((c: any) => (
                                <ClientCard key={c.id} client={c} t={t} />
                            ))}
                        </div>
                    );
                }

                if (r.tool === "get_client_details" && r.result) {
                    return <ClientCard key={i} client={r.result} t={t} />;
                }

                if (r.tool === "search_agents" && Array.isArray(r.result)) {
                    // When more than 5 results are returned, display as a clean table with Manage links!
                    if (r.result.length > 5) {
                        return <AgentResultsTable key={i} agents={r.result} t={t} />;
                    }
                    return (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {r.result.map((a: any) => (
                                <AgentCard key={a.id} agent={a} t={t} />
                            ))}
                        </div>
                    );
                }

                if (r.tool === "search_applications" && Array.isArray(r.result)) {
                    // When more than 5 results are returned, display as a clean table with Manage links!
                    if (r.result.length > 5) {
                        return <ApplicationResultsTable key={i} apps={r.result} t={t} />;
                    }
                    return (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {r.result.map((a: any) => (
                                <ApplicationCard key={a.id} app={a} t={t} />
                            ))}
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}
