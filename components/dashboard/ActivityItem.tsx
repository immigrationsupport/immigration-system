"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Info } from "lucide-react";
import { TruncatedText } from "@/components/ui/truncated-text";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface ActivityItemProps {
    log: {
        id: string;
        action: string;
        details: string | null;
        createdAt: Date | string;
        author: { name: string; role: string } | null;
    };
}

const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
};

const getActionColor = (action: string) => {
    if (action.includes("LOGIN")) return "bg-blue-50 text-blue-700 bg-opacity-80 border-blue-100";
    if (action.includes("CREATE")) return "bg-emerald-50 text-emerald-700 bg-opacity-80 border-emerald-100";
    if (action.includes("SUBMISSION")) return "bg-amber-50 text-amber-700 bg-opacity-80 border-amber-100";
    return "bg-slate-50 text-slate-700 border-slate-100";
};

export function ActivityItem({ log }: ActivityItemProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="relative pl-6 border-l-2 border-slate-50 py-1 transition-all hover:bg-slate-50 rounded-r-lg group">
            <div className="absolute -left-[6px] top-2 h-2.5 w-2.5 rounded-full bg-blue-100 border-2 border-white group-hover:bg-[#1E3A8A] transition-colors"></div>
            <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, " ")}
                        </span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                            {getTimeAgo(new Date(log.createdAt))}
                        </p>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-700 leading-tight pr-4">
                            <TruncatedText text={log.details || ""} maxLength={60} />
                        </p>
                        <button 
                            onClick={() => setShowDetails(true)}
                            className="p-1 text-gray-400 hover:text-[#1E3A8A] transition-colors"
                            title="View Details"
                        >
                            <ChevronDown size={14} className="opacity-0 group-hover:opacity-100" />
                        </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-4 w-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                            {log.author?.name?.[0] || "S"}
                        </div>
                        <p className="text-[11px] text-[#1E3A8A] font-bold">
                            <TruncatedText text={log.author?.name || "System"} maxLength={20} /> <span className="text-gray-300 font-normal px-1">|</span> <span className="text-gray-400 capitalize">{log.author?.role?.toLowerCase() || "system"}</span>
                        </p>
                    </div>
                </div>
            </div>

            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#1E3A8A]">
                            <Info size={18} />
                            Activity Details
                        </DialogTitle>
                        <DialogDescription className="text-xs font-black uppercase tracking-widest text-gray-400">
                            {log.action.replace(/_/g, " ")} | {new Date(log.createdAt).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {log.details || "No details provided."}
                        </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-gray-400">
                        <Clock size={12} />
                        Author: {log.author?.name || "System"} ({log.author?.role || "SYSTEM"})
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
