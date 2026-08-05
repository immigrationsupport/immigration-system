"use client";

import React, { useState } from "react";
import {
    Search,
    Filter,
    Trash2,
    Globe,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Loader2,
    Eye,
    ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateApplicationAction, deleteApplicationAction } from "./actions";
import ApplicationDetailsModal from "./application-details-modal";
import { TruncatedText } from "@/components/ui/truncated-text";

interface Application {
    id: string;
    type: string;
    status: string;
    destination: string;
    createdAt: Date;
    client: {
        id: string;
        name: string;
        email: string;
    };
    agent: {
        id: string;
        name: string;
    } | null;
}

interface Agent {
    id: string;
    name: string;
}

export default function ApplicationTable({
    initialApplications,
    agents
}: {
    initialApplications: any[],
    agents: Agent[]
}) {
    const [applications, setApplications] = useState<Application[]>(initialApplications);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

    const filteredApplications = applications.filter(app => {
        const matchesSearch =
            app.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = async (appId: string, newStatus: string) => {
        setLoadingId(appId);
        const res = await updateApplicationAction(appId, { status: newStatus });
        setLoadingId(null);

        if (res.success) {
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
        }
    };

    const handleAgentChange = async (appId: string, agentId: string) => {
        setLoadingId(appId);
        const res = await updateApplicationAction(appId, { agentId: agentId === "null" ? null : agentId });
        setLoadingId(null);

        if (res.success) {
            const agent = agents.find(a => a.id === agentId) || null;
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, agent: agent } : a));
        }
    };

    const handleDelete = async (appId: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this application and all related documents? This action cannot be undone.")) return;

        setLoadingId(appId);
        const res = await deleteApplicationAction(appId);
        setLoadingId(null);

        if (res.success) {
            setApplications(prev => prev.filter(a => a.id !== appId));
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "APPROVED": 
            case "VALIDATED": 
                return { bg: "bg-gray-50", text: "text-green-700", border: "border-gray-200", icon: <CheckCircle2 size={14} /> };
            case "REJECTED": 
                return { bg: "bg-gray-50", text: "text-red-700", border: "border-gray-200", icon: <XCircle size={14} /> };
            case "PENDING": 
            case "IN_PROGRESS":
                return { bg: "bg-gray-50", text: "text-amber-700", border: "border-gray-200", icon: <Clock size={14} /> };
            case "SUBMITTED":
                return { bg: "bg-gray-50", text: "text-blue-700", border: "border-gray-200", icon: <AlertCircle size={14} /> };
            default: 
                return { bg: "bg-gray-50", text: "text-blue-700", border: "border-gray-200", icon: <AlertCircle size={14} /> };
        }
    };

    return (
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Filters */}
            <div className="p-6 lg:p-8 border-b border-gray-200 bg-[#F9FAFB] flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#374151]" />
                    <Input
                        placeholder="Search by client, email or ID..."
                        className="pl-12 h-12 text-[16px] bg-white border-gray-300 focus:ring-blue-100 placeholder-[#6B7280]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter className="h-5 w-5 text-[#374151]" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-[16px] border border-gray-300 rounded-md bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 min-w-[160px]"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-100/80">
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 first:rounded-tl-xl whitespace-nowrap">Client & App Info</th>
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Destination</th>
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Assigned Agent</th>
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Status</th>
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Created At</th>
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-right last:rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredApplications.map((app) => (
                            <tr key={app.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1E3A8A] text-[14px] font-bold border border-blue-200">
                                            {app.client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                             <p className="text-[16px] lg:text-[18px] font-extrabold text-[#111827] leading-none mb-1.5">
                                                <TruncatedText text={app.client.name} maxLength={20} />
                                             </p>
                                            <p className="text-[14px] text-[#6B7280] font-mono font-bold">ID: {app.id.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-[16px] lg:text-[18px] text-[#374151] font-bold">
                                        <Globe size={18} className="text-blue-500" />
                                         <TruncatedText text={app.destination} maxLength={20} />
                                    </div>
                                    <p className="text-[12px] lg:text-[14px] font-bold uppercase tracking-tight text-[#6B7280] mt-1">{(app.type || "GENERAL").replace('_', ' ')}</p>
                                </td>

                                <td className="px-6 py-5">
                                    <select
                                        value={app.agent?.id || "null"}
                                        onChange={(e) => handleAgentChange(app.id, e.target.value)}
                                        className="bg-white border border-gray-300 text-[#374151] hover:text-[#1E3A8A] hover:border-[#1E3A8A] rounded px-3 py-2 cursor-pointer outline-none focus:ring-1 focus:ring-blue-200 transition-all text-[16px] font-bold min-w-[160px] max-w-[200px] truncate"
                                        disabled={loadingId === app.id}
                                    >
                                        <option value="null">Select Agent...</option>
                                        {agents.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name.length > 20 ? a.name.substring(0, 20) + "..." : a.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={app.status}
                                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                            className={`
                                                ${getStatusStyles(app.status).bg} 
                                                ${getStatusStyles(app.status).text} 
                                                ${getStatusStyles(app.status).border} 
                                                text-[14px] font-extrabold uppercase tracking-tight px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all hover:brightness-95 min-w-[130px] shadow-sm
                                            `}
                                            disabled={loadingId === app.id}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="IN_PROGRESS">IN PROGRESS</option>
                                            <option value="SUBMITTED">SUBMITTED</option>
                                            <option value="IN_REVIEW">IN REVIEW</option>
                                            <option value="APPROVED">APPROVED</option>
                                            <option value="REJECTED">REJECTED</option>
                                        </select>
                                        {loadingId === app.id && <Loader2 size={16} className="animate-spin text-blue-500" />}
                                    </div>
                                </td>

                                <td className="px-6 py-5 text-[#4B5563] text-[16px] lg:text-[18px] font-bold">
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <Calendar size={18} className="text-[#9CA3AF]" />
                                        {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>

                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-1  transition-all duration-300">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-12 w-12 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 bg-white"
                                            onClick={() => setSelectedAppId(app.id)}
                                            title="View Details"
                                        >
                                            <Eye size={24} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-12 w-12 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 bg-white"
                                            onClick={() => handleDelete(app.id)}
                                            disabled={loadingId === app.id}
                                            title="Delete Application"
                                        >
                                            <Trash2 size={24} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredApplications.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-[#6B7280]">
                        <Briefcase size={50} className="mb-4 opacity-30" />
                        <p className="text-[18px] font-bold">No applications found.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedAppId && (
                <ApplicationDetailsModal
                    applicationId={selectedAppId}
                    onClose={() => setSelectedAppId(null)}
                />
            )}
        </div>
    );
}
