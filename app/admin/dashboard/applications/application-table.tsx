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
import { updateApplicationAction, deleteApplicationAction } from "@/app/admin/dashboard/applications/actions";
import ApplicationDetailsModal from "@/app/admin/dashboard/applications/application-details-modal";

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
            case "APPROVED": return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: <CheckCircle2 size={14} /> };
            case "REJECTED": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <XCircle size={14} /> };
            case "PENDING": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <Clock size={14} /> };
            default: return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <AlertCircle size={14} /> };
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Filters */}
            <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by client, email or ID..."
                        className="pl-9 bg-white border-gray-200 focus:ring-blue-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm border-gray-200 rounded-md bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-50/80">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 first:rounded-tl-xl whitespace-nowrap">Client & App Info</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Destination</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Assigned Agent</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Created At</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 text-right last:rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredApplications.map((app) => (
                            <tr key={app.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-black border border-blue-200">
                                            {app.client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{app.client.name}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">ID: {app.id.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                        <Globe size={14} className="text-blue-400" />
                                        {app.destination}
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-tighter text-gray-400 mt-1">{(app.type || "GENERAL").replace('_', ' ')}</p>
                                </td>

                                <td className="px-6 py-4">
                                    <select
                                        value={app.agent?.id || "null"}
                                        onChange={(e) => handleAgentChange(app.id, e.target.value)}
                                        className="bg-gray-100/50 border-none text-gray-600 hover:text-[#1E3A8A] hover:bg-white rounded px-2 py-1 cursor-pointer outline-none focus:ring-1 focus:ring-blue-200 transition-all text-xs font-semibold"
                                        disabled={loadingId === app.id}
                                    >
                                        <option value="null">Select Agent...</option>
                                        {agents.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={app.status}
                                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                            className={`
                                                ${getStatusStyles(app.status).bg} 
                                                ${getStatusStyles(app.status).text} 
                                                ${getStatusStyles(app.status).border} 
                                                text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-full border outline-none cursor-pointer transition-all hover:brightness-95
                                            `}
                                            disabled={loadingId === app.id}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="IN_REVIEW">IN REVIEW</option>
                                            <option value="APPROVED">APPROVED</option>
                                            <option value="REJECTED">REJECTED</option>
                                        </select>
                                        {loadingId === app.id && <Loader2 size={12} className="animate-spin text-blue-400" />}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <Calendar size={13} className="text-gray-300" />
                                        {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-white shadow-sm"
                                            onClick={() => setSelectedAppId(app.id)}
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-white shadow-sm"
                                            onClick={() => handleDelete(app.id)}
                                            disabled={loadingId === app.id}
                                            title="Delete Application"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredApplications.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <Briefcase size={40} className="mb-3 opacity-20" />
                        <p className="text-sm">No applications found.</p>
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
