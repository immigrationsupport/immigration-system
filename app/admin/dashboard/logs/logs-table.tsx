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
    Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Author {
    id: string;
    name: string;
    role: string;
    email: string;
}

interface LogItem {
    id: string;
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

    const isAnomaly = (action: string, details: string) => {
        const str = (action + details).toLowerCase();
        return str.includes("delete") ||
            str.includes("fail") ||
            str.includes("unauthorized") ||
            str.includes("error") ||
            str.includes("suspicious") ||
            str.includes("remove") ||
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
        if (a.includes("DELETE") || a.includes("REMOVE") || a.includes("FAIL") || a.includes("REJECT")) {
            return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <ShieldAlert size={14} /> };
        }
        if (a.includes("UPDATE") || a.includes("MODIFY") || a.includes("ASSIGN")) {
            return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <RefreshCw size={14} /> };
        }
        if (a.includes("CREATE") || a.includes("ADD") || a.includes("UPLOAD") || a.includes("VERIFY")) {
            return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: <Activity size={14} /> };
        }
        if (a.includes("LOGIN") || a.includes("AUTH")) {
            return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: <UserCircle size={14} /> };
        }
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <FileText size={14} /> };
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

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider font-extrabold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Action Event</th>
                            <th className="px-6 py-4 w-1/3">Context / Target Details</th>
                            <th className="px-6 py-4">Author Profile</th>
                            <th className="px-6 py-4 w-48">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredLogs.map((log) => {
                            const styles = getActionStyles(log.action);
                            const anomalyDetected = isAnomaly(log.action, log.details);

                            return (
                                <tr key={log.id} className={`hover:bg-slate-50/50 transition-colors ${anomalyDetected && typeFilter === 'ANOMALY' ? 'bg-red-50/20' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg border ${styles.bg} ${styles.border} ${styles.text}`}>
                                            {styles.icon}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{log.action.replace(/_/g, " ")}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-700 leading-snug">{log.details}</p>
                                        {anomalyDetected && (
                                            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-red-500 font-bold uppercase tracking-wider">
                                                <AlertTriangle size={12} /> Detected System Anomaly
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.author ? (
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                                    {log.author.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 leading-tight">{log.author.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`flex items-center text-[8px] uppercase font-black px-1.5 py-0.5 rounded leading-none ${log.author.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' :
                                                                log.author.role === 'AGENT' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {log.author.role}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 truncate max-w-[120px]" title={log.author.email}>{log.author.email || "unknown"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400 bg-gray-50 w-fit px-3 py-2 rounded-lg border border-gray-100">
                                                <Shield size={14} className="text-slate-400" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">System Bot</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-semibold">
                                        <div className="flex flex-col gap-1 w-fit bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={13} className="text-blue-400" />
                                                {new Date(log.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock size={13} />
                                                {new Date(log.createdAt).toLocaleTimeString()}
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
