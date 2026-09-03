"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    ShieldAlert,
    UserCircle,
    FileText,
    RefreshCw,
    Calendar,
    Clock,
    Activity,
    UserCog,
    Shield,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { TruncatedText } from "@/components/ui/truncated-text";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { resolveAuditDetails } from "@/lib/audit-log-render";
import { TablePagination } from "@/components/ui/table-pagination";

interface Author {
    id: string;
    name: string;
    role: string;
    email: string;
}

interface LogItem {
    id: string;
    logNumber: number;
    action: string;
    details: string;
    createdAt: Date;
    author: Author | null;
}

const PAGE_SIZE = 10;

export default function LogsTable({
    initialLogs
}: {
    initialLogs: LogItem[]
}) {
    const t = useTranslations("adminLogs");
    const tAudit = useTranslations("auditLog");
    const tAction = useTranslations("auditActions");

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);

    const toggleExpand = (id: string) => {
        const next = new Set(expandedLogs);

        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }

        setExpandedLogs(next);
    };

    const isAnomaly = (action: string, details: string) => {
        const str = (action + details).toLowerCase();

        return (
            str.includes("delete") ||
            str.includes("fail") ||
            str.includes("unauthorized") ||
            str.includes("error") ||
            str.includes("suspicious") ||
            str.includes("remove") ||
            str.includes("suspend") ||
            str.includes("reject")
        );
    };

    const filteredLogs = initialLogs.filter((log) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            log.action.toLowerCase().includes(search) ||
            log.details.toLowerCase().includes(search) ||
            (log.author?.name?.toLowerCase() || "").includes(search);

        let matchesType = true;

        if (typeFilter === "AGENT") {
            matchesType = log.author?.role === "AGENT";
        } else if (typeFilter === "ANOMALY") {
            matchesType = isAnomaly(log.action, log.details);
        }

        return matchesSearch && matchesType;
    });

    useEffect(() => {
        setPage(1);
    }, [searchTerm, typeFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredLogs.length / PAGE_SIZE)
    );

    const safePage = Math.min(page, totalPages);

    const paginatedLogs = filteredLogs.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    const getActionStyles = (action: string) => {
        const a = action.toUpperCase();

        if (
            a.includes("DELETE") ||
            a.includes("REMOVE") ||
            a.includes("FAIL") ||
            a.includes("REJECT") ||
            a.includes("SUSPEND")
        ) {
            return {
                bg: "bg-gray-50",
                text: "text-red-700",
                icon: <ShieldAlert size={14} />
            };
        }

        if (
            a.includes("SEND_MESSAGE") ||
            a.includes("NOTIFICATION")
        ) {
            return {
                bg: "bg-gray-50",
                text: "text-blue-700",
                icon: <Activity size={14} />
            };
        }

        if (
            a.includes("UPDATE") ||
            a.includes("MODIFY") ||
            a.includes("ASSIGN")
        ) {
            return {
                bg: "bg-gray-50",
                text: "text-amber-700",
                icon: <RefreshCw size={14} />
            };
        }

        if (
            a.includes("CREATE") ||
            a.includes("ADD") ||
            a.includes("UPLOAD") ||
            a.includes("VERIFY")
        ) {
            return {
                bg: "bg-gray-50",
                text: "text-green-700",
                icon: <Activity size={14} />
            };
        }

        if (
            a.includes("LOGIN") ||
            a.includes("AUTH")
        ) {
            return {
                bg: "bg-gray-50",
                text: "text-purple-700",
                icon: <UserCircle size={14} />
            };
        }

        return {
            bg: "bg-gray-50",
            text: "text-blue-700",
            icon: <FileText size={14} />
        };
    };

    return (
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 lg:p-8 border-b border-gray-200 bg-[#F9FAFB] flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#374151]" />

                    <Input
                        placeholder={t("searchPlaceholder")}
                        className="pl-12 h-12 text-[16px] bg-white border-gray-300 focus:ring-blue-100 placeholder-[#6B7280]"
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />
                </div>

                <div className="flex gap-3 p-1 bg-gray-100 rounded-lg w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => setTypeFilter("ALL")}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-[14px] lg:text-[16px] font-bold rounded-md transition-all ${
                            typeFilter === "ALL"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-[#4B5563] hover:text-[#111827]"
                        }`}
                    >
                        {t("filterAll")}
                    </button>

                    <button
                        type="button"
                        onClick={() => setTypeFilter("AGENT")}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-[14px] lg:text-[16px] font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                            typeFilter === "AGENT"
                                ? "bg-[#1E3A8A] text-white shadow-sm"
                                : "text-[#4B5563] hover:text-[#111827]"
                        }`}
                    >
                        <UserCog size={18} />
                        {t("filterAgent")}
                    </button>

                    <button
                        type="button"
                        onClick={() => setTypeFilter("ANOMALY")}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-[14px] lg:text-[16px] font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                            typeFilter === "ANOMALY"
                                ? "bg-red-600 text-white shadow-sm hover:bg-red-700"
                                : "text-[#4B5563] hover:text-red-600"
                        }`}
                    >
                        <ShieldAlert size={18} />
                        {t("filterAnomaly")}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-100/80">
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 first:rounded-tl-xl whitespace-nowrap">
                                {t("colRef")}
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">
                                {t("colAction")}
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 w-1/3">
                                {t("colContext")}
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">
                                {t("colAuthor")}
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 last:rounded-tr-xl">
                                {t("colTimestamp")}
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedLogs.map((log) => {
                            const styles = getActionStyles(log.action);
                            const anomalyDetected = isAnomaly(
                                log.action,
                                log.details
                            );

                            const actionLabel = tAction.has(log.action)
                                ? tAction(log.action)
                                : log.action.replace(/_/g, " ");

                            const detailsText = resolveAuditDetails(
                                log.details,
                                tAudit,
                                t("noDetails")
                            );

                            return (
                                <tr
                                    key={log.id}
                                    className={`hover:bg-blue-50/40 transition-all duration-200 group ${
                                        anomalyDetected &&
                                        typeFilter === "ANOMALY"
                                            ? "bg-red-50/20"
                                            : ""
                                    }`}
                                >
                                    <td className="px-6 py-5 align-top">
                                        <span className="inline-flex text-[14px] font-extrabold text-[#6B7280] bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                                            LOG-
                                            {log.logNumber
                                                .toString()
                                                .padStart(4, "0")}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5 align-top">
                                        <div
                                            className={`flex items-center gap-2 w-fit px-3 py-1 rounded ${styles.bg} ${styles.text}`}
                                        >
                                            {styles.icon}

                                            <span className="text-[14px] font-extrabold uppercase tracking-widest leading-none">
                                                {actionLabel}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 align-top">
                                        <div className="space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-[16px] lg:text-[18px] font-medium text-[#374151] leading-snug">
                                                    <TruncatedText
                                                        text={detailsText}
                                                        maxLength={30}
                                                    />
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleExpand(log.id)
                                                    }
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-blue-600"
                                                    title={t(
                                                        "viewFullDetails"
                                                    )}
                                                >
                                                    {expandedLogs.has(
                                                        log.id
                                                    ) ? (
                                                        <ChevronUp
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <ChevronDown
                                                            size={20}
                                                        />
                                                    )}
                                                </button>
                                            </div>

                                            {expandedLogs.has(log.id) && (
                                                <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 text-[14px] text-[#4B5563] animate-in slide-in-from-top-1 duration-200 shadow-inner max-h-48 overflow-y-auto custom-scrollbar">
                                                    <p className="whitespace-pre-wrap font-mono leading-relaxed">
                                                        {detailsText}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {anomalyDetected && (
                                            <div className="flex items-center gap-1 mt-2 text-[12px] text-red-600 font-extrabold uppercase tracking-wider"></div>
                                        )}
                                    </td>

                                    <td className="px-6 py-5 align-top">
                                        {log.author ? (
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E3A8A] text-[14px] font-extrabold">
                                                    {log.author.name[0]?.toUpperCase()}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <p className="text-[16px] lg:text-[18px] font-extrabold text-[#111827] leading-tight">
                                                        <TruncatedText
                                                            text={
                                                                log.author
                                                                    .name
                                                            }
                                                            maxLength={10}
                                                        />
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span
                                                            className={`flex items-center text-[10px] lg:text-[12px] uppercase font-bold px-2 py-1 rounded leading-none ${
                                                                log.author
                                                                    .role ===
                                                                "ADMIN"
                                                                    ? "bg-indigo-100 text-indigo-800"
                                                                    : log
                                                                          .author
                                                                          .role ===
                                                                      "AGENT"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-gray-200 text-gray-800"
                                                            }`}
                                                        >
                                                            {
                                                                log.author
                                                                    .role
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[#6B7280] bg-gray-100 w-fit px-3 py-1.5 rounded-lg border border-gray-200">
                                                <Shield
                                                    size={16}
                                                    className="text-[#6B7280]"
                                                />

                                                <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#6B7280]">
                                                    {t("systemCore")}
                                                </span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-5 align-top">
                                        <div className="flex flex-col gap-2 text-[14px] lg:text-[16px] font-medium text-[#4B5563]">
                                            <div className="flex items-center gap-2">
                                                <Calendar
                                                    size={16}
                                                    className="text-[#9CA3AF]"
                                                />

                                                {new Date(
                                                    log.createdAt
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-[#6B7280]">
                                                <Clock size={16} />

                                                {new Date(
                                                    log.createdAt
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredLogs.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-[#6B7280]">
                        <ShieldAlert
                            size={50}
                            className="mb-4 opacity-30"
                        />

                        <p className="text-[18px] font-bold">
                            {t("noLogsFound")}
                        </p>

                        <p className="text-[16px] mt-2">
                            {t("adjustFilters")}
                        </p>
                    </div>
                )}
            </div>

            {filteredLogs.length > PAGE_SIZE && (
                <div className="px-6 pb-6">
                    <TablePagination
                        page={safePage}
                        totalItems={filteredLogs.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}