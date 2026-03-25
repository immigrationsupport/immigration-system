"use client";

import React, { useState } from "react";
import {
    Search,
    AlertTriangle,
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function LogsTable({
    initialLogs
}: {
    initialLogs: LogItem[]
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL"); // ALL, AGENT, ANOMALY
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const next = new Set(expandedLogs);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedLogs(next);
    };

    const isAnomaly = (action: string, details: string) => {
        const str = (action + details).toLowerCase();
        return str.includes("delete") ||
            str.includes("fail") ||
            str.includes("unauthorized") ||
            str.includes("error") ||
            str.includes("suspicious") ||
            str.includes("remove") ||
            str.includes("suspend") ||
            str.includes("reject");
    };

    const filteredLogs = initialLogs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.author?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());

        let matchesType = true;
        if (typeFilter === "AGENT") {
            matchesType = log.author?.role === "AGENT";
        } else if (typeFilter === "ANOMALY") {
            matchesType = isAnomaly(log.action, log.details);
        }

        return matchesSearch && matchesType;
    });

    const getActionStyles = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes("DELETE") || a.includes("REMOVE") || a.includes("FAIL") || a.includes("REJECT") || a.includes("SUSPEND")) {
            return { bg: "bg-gray-50", text: "text-red-700", icon: <ShieldAlert size={14} /> };
        }
        if (a.includes("SEND_MESSAGE") || a.includes("NOTIFICATION")) {
            return { bg: "bg-gray-50", text: "text-blue-700", icon: <Activity size={14} /> };
        }
        if (a.includes("UPDATE") || a.includes("MODIFY") || a.includes("ASSIGN")) {
            return { bg: "bg-gray-50", text: "text-amber-700", icon: <RefreshCw size={14} /> };
        }
        if (a.includes("CREATE") || a.includes("ADD") || a.includes("UPLOAD") || a.includes("VERIFY")) {
            return { bg: "bg-gray-50", text: "text-green-700", icon: <Activity size={14} /> };
        }
        if (a.includes("LOGIN") || a.includes("AUTH")) {
            return { bg: "bg-gray-50", text: "text-purple-700", icon: <UserCircle size={14} /> };
        }
        return { bg: "bg-gray-50", text: "text-blue-700", icon: <FileText size={14} /> };
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search action, details, or user..."
                        className="pl-9 bg-white border-gray-200 focus:ring-blue-100 placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full md:w-auto">
                    <button
                        onClick={() => setTypeFilter("ALL")}
                        className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${typeFilter === "ALL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        All Activity
                    </button>
                    <button
                        onClick={() => setTypeFilter("AGENT")}
                        className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${typeFilter === "AGENT" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <UserCog size={14} /> Agent Actions
                    </button>
                    <button
                        onClick={() => setTypeFilter("ANOMALY")}
                        className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${typeFilter === "ANOMALY" ? "bg-red-600 text-white shadow-sm hover:bg-red-700" : "text-gray-500 hover:text-red-600"}`}
                    >
                        <ShieldAlert size={14} /> Anomalies
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-50/80">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 first:rounded-tl-xl whitespace-nowrap">Ref #</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Action Event</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 w-1/3">Context / Target Details</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Author Profile</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 last:rounded-tr-xl">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredLogs.map((log) => {
                            const styles = getActionStyles(log.action);
                            const anomalyDetected = isAnomaly(log.action, log.details);

                            return (
                                <tr key={log.id} className={`hover:bg-blue-50/40 transition-all duration-200 group ${anomalyDetected && typeFilter === 'ANOMALY' ? 'bg-red-50/20' : ''}`}>
                                    <td className="px-6 py-4 align-top">
                                        <span className="inline-flex text-[10px] font-black text-slate-500 bg-gray-100/50 px-2 py-1 rounded border border-gray-100">
                                            LOG-{log.logNumber.toString().padStart(4, '0')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className={`flex items-center gap-2 w-fit px-2.5  ${styles.bg} ${styles.text}`}>
                                            {styles.icon}
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{log.action.replace(/_/g, " ")}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium text-gray-700 leading-snug">
                                                    <TruncatedText text={log.details} maxLength={50} />
                                                </p>
                                                <button 
                                                    onClick={() => toggleExpand(log.id)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-blue-600"
                                                    title="View Full Details"
                                                >
                                                    {expandedLogs.has(log.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            </div>
                                            {expandedLogs.has(log.id) && (
                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 animate-in slide-in-from-top-1 duration-200 shadow-inner max-h-32 overflow-y-auto custom-scrollbar">
                                                    <p className="whitespace-pre-wrap font-mono leading-relaxed">{log.details}</p>
                                                </div>
                                            )}
                                        </div>
                                        {anomalyDetected && (
                                            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-red-500 font-bold uppercase tracking-wider">
                                                
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        {log.author ? (
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-black">
                                                    {log.author.name[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-gray-900 leading-tight">
                                                        <TruncatedText text={log.author.name} maxLength={10} />
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`flex items-center text-[8px] uppercase font-black px-1.5 py-0.5 rounded leading-none ${log.author.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' :
                                                            log.author.role === 'AGENT' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {log.author.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400 bg-gray-50/50 w-fit px-2.5 py-1.5 rounded-lg border border-gray-100">
                                                <Shield size={12} className="text-slate-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">System Core</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col gap-1 text-[11px] font-medium text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-gray-400" />
                                                {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Clock size={12} />
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <ShieldAlert size={48} className="mb-4 text-gray-300" />
                        <p className="text-base font-bold text-gray-600">No logs found</p>
                        <p className="text-sm mt-1 text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
