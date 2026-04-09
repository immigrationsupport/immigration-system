"use client";

import React, { useState } from "react";
import { Search, Ban, UserX, Replace, UserPlus, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { assignAgentToClientAction, toggleSuspendClientAction, validateClientAction, deleteClientAction } from "./actions";
import { Button } from "@/components/ui/button";
import { TruncatedText } from "@/components/ui/truncated-text";

interface Client {
    id: string;
    name: string;
    email: string;
    role: string | null;
    status: string;
    isSuspended: boolean;
    agentId: string | null;
    agent?: {
        name: string;
    } | null;
}

interface Agent {
    id: string;
    name: string;
}

interface ClientListProps {
    initialClients: any[];
    agents: Agent[];
}

export default function ClientList({ initialClients, agents }: ClientListProps) {
    const [search, setSearch] = useState("");
    const [clients, setClients] = useState(initialClients);
    const [isAssigning, setIsAssigning] = useState<string | null>(null); // clientId of client being reassigned

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleAssign = async (clientId: string, agentId: string) => {
        const res = await assignAgentToClientAction(clientId, agentId);
        if (res.error) {
            alert(res.error);
        } else {
            setIsAssigning(null);
            // Re-fetch or update local state as needed (server action revalidatePath handles it mostly)
            window.location.reload(); // Simple way to refresh for now
        }
    };

    const handleToggleSuspend = async (clientId: string, isCurrentlySuspended: boolean) => {
    const action = isCurrentlySuspended ? "unsuspend" : "suspend";


    const confirmed = window.confirm(`Are you sure you want to ${action} this client?`);

    if (confirmed) {
        const res = await toggleSuspendClientAction(clientId, isCurrentlySuspended);
        
        if (res.error) {
            alert(res.error);
        } else {
            window.location.reload();
        }
    }
};

    const handleValidate = async (clientId: string) => {
        if (!confirm("Are you sure you want to validate this client? This grants them full access.")) return;
        const res = await validateClientAction(clientId);
        if (res.error) alert(res.error);
        else window.location.reload();
    };

    const handleDelete = async (clientId: string) => {
        if (!confirm("Are you sure you want to permanently delete this client? This action cannot be undone.")) return;
        const res = await deleteClientAction(clientId);
        if (res.error) alert(res.error);
        else window.location.reload();
    };

    return (
        <div className="bg-[#F9FAFB] p-6 lg:p-8 shadow-sm border border-gray-200" style={{ borderRadius: "8px" }}>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 md:w-1/2">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#374151]" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-12 h-12 bg-white border-gray-300 text-[16px] placeholder-[#6B7280]"
                        style={{ borderRadius: "8px" }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-100/80">
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 first:rounded-tl-xl whitespace-nowrap">Client Name</th>
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Email</th>
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Assigned Agent</th>
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Status</th>
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-right last:rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredClients.map((client) => (
                            <tr key={client.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[14px] font-bold text-[#1E3A8A]">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-extrabold text-[16px] lg:text-[18px] text-[#111827]">
                                            <TruncatedText text={client.name} maxLength={20} />
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-[#374151] font-semibold text-[16px] lg:text-[18px]">
                                    <TruncatedText text={client.email} maxLength={25} />
                                </td>
                                <td className="px-6 py-5 max-w-[200px] truncate text-[16px] lg:text-[18px]">
                                    {isAssigning === client.id ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="border border-gray-300 rounded px-3 py-2 text-[16px] bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all min-w-[120px] max-w-[180px] truncate"
                                                defaultValue={client.agentId || ""}
                                                onChange={(e) => handleAssign(client.id, e.target.value)}
                                            >
                                                <option value="" disabled>Select Agent</option>
                                                {agents.map(agent => (
                                                    <option key={agent.id} value={agent.id}>
                                                        {agent.name.length > 20 ? agent.name.substring(0, 20) + "..." : agent.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button onClick={() => setIsAssigning(null)} className="text-red-500 hover:text-red-600 transition-colors">
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {client.agent ? (
                                                <span className="font-bold text-[#374151] max-w-[150px] truncate block" title={client.agent.name}>{client.agent.name}</span>
                                            ) : (
                                                <span className="text-[14px] font-bold uppercase tracking-tighter text-gray-400 italic">Unassigned</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-2">
                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-tight w-max ${
                                            client.status === "PENDING"
                                            ? "bg-amber-100 text-amber-800 border-amber-200"
                                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                        }`}>
                                            {client.status === "PENDING" ? "Pending" : "Validated"}
                                        </span>
                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-tight w-max ${
                                            client.isSuspended 
                                            ? "bg-red-100 text-red-800 border-red-200" 
                                            : "hidden"
                                        }`}>
                                            
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 transition-all duration-300">
                                        {client.status === "PENDING" && (
                                            <button
                                                className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg shadow-sm transition-all bg-white"
                                                title="Validate Client"
                                                onClick={() => handleValidate(client.id)}
                                            >
                                                <CheckCircle2 size={20} />
                                            </button>
                                        )}
                                        <button
                                            className="p-2 text-[#374151] hover:text-[#1E3A8A] hover:bg-white rounded-lg transition-all disabled:opacity-50"
                                            title={client.isSuspended ? "Cannot assign agent to suspended client" : "Assign/Reassign Agent"}
                                            disabled={client.isSuspended}
                                            onClick={() => setIsAssigning(client.id)}
                                        >
                                            <Replace size={20} />
                                        </button>

                                        <button
                                            className={`p-2 rounded-lg transition-all bg-white ${client.isSuspended ? "text-emerald-600 hover:bg-emerald-50" : "text-red-500 hover:bg-red-50"}`}
                                            title={client.isSuspended ? "Unsuspend Client" : "Suspend Client"}
                                            onClick={() => handleToggleSuspend(client.id, client.isSuspended)}
                                        >
                                            <Ban size={20} />
                                        </button>
                                        <button
                                            className="p-2 text-red-700 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all bg-white"
                                            title="Delete Client"
                                            onClick={() => handleDelete(client.id)}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredClients.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-[#374151] font-bold uppercase tracking-widest text-[16px]">
                                    No clients found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
