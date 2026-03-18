"use client";

import React, { useState } from "react";
import { Search, Ban, UserX, Replace, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { assignAgentToClientAction, toggleSuspendClientAction } from "./actions";
import { Button } from "@/components/ui/button";
import { TruncatedText } from "@/components/ui/truncated-text";

interface Client {
    id: string;
    name: string;
    email: string;
    role: string | null;
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

    const handleToggleSuspend = async (clientId: string, isSuspended: boolean) => {
        const res = await toggleSuspendClientAction(clientId, isSuspended);
        if (res.error) alert(res.error);
        else window.location.reload();
    };

    return (
        <div className="bg-white p-6 shadow-sm border border-gray-100" style={{ borderRadius: "8px" }}>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 md:w-1/2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-9 h-10 bg-gray-50 border-gray-200"
                        style={{ borderRadius: "8px" }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-50/80">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 first:rounded-tl-xl whitespace-nowrap">Client Name</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Email</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Assigned Agent</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 text-right last:rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredClients.map((client) => (
                            <tr key={client.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-[#1E3A8A]">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-gray-900">
                                            <TruncatedText text={client.name} maxLength={18} />
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-medium">
                                    <TruncatedText text={client.email} maxLength={25} />
                                </td>
                                <td className="px-6 py-4 max-w-[200px] truncate">
                                    {isAssigning === client.id ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all min-w-[120px] max-w-[160px] truncate"
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
                                            <button onClick={() => setIsAssigning(null)} className="text-red-400 hover:text-red-500 transition-colors">
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {client.agent ? (
                                                <span className="font-semibold text-gray-700 max-w-[150px] truncate block" title={client.agent.name}>{client.agent.name}</span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-gray-300 italic">Unassigned</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                        client.isSuspended 
                                        ? "bg-red-50 text-red-600 border border-red-100" 
                                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    }`}>
                                        {client.isSuspended ? "Suspended" : "Active"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            className="p-1.5 text-gray-400 hover:text-[#1E3A8A] hover:bg-white rounded-lg shadow-sm transition-all disabled:opacity-50"
                                            title={client.isSuspended ? "Cannot assign agent to suspended client" : "Assign/Reassign Agent"}
                                            disabled={client.isSuspended}
                                            onClick={() => setIsAssigning(client.id)}
                                        >
                                            <Replace size={16} />
                                        </button>

                                        <button
                                            className={`p-1.5 rounded-lg shadow-sm transition-all bg-white ${client.isSuspended ? "text-emerald-500 hover:bg-emerald-50" : "text-orange-400 hover:bg-orange-50"}`}
                                            title={client.isSuspended ? "Unsuspend Client" : "Suspend Client"}
                                            onClick={() => handleToggleSuspend(client.id, client.isSuspended)}
                                        >
                                            <Ban size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredClients.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
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
