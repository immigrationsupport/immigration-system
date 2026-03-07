"use client";

import React, { useState } from "react";
import { Search, Ban, UserX, Replace, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { assignAgentToClientAction, toggleSuspendClientAction } from "./actions";
import { Button } from "@/components/ui/button";

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
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 font-medium">Client Name</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Assigned Agent</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredClients.map((client) => (
                            <tr key={client.id} className="hover:bg-gray-50 transition-colors bg-white">
                                <td className="px-4 py-4 font-medium text-gray-900 border-l-2 border-transparent hover:border-blue-800">
                                    {client.name}
                                </td>
                                <td className="px-4 py-4 text-gray-500">{client.email}</td>
                                <td className="px-4 py-4">
                                    {isAssigning === client.id ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="border rounded p-1 text-sm bg-gray-50"
                                                defaultValue={client.agentId || ""}
                                                onChange={(e) => handleAssign(client.id, e.target.value)}
                                            >
                                                <option value="" disabled>Select Agent</option>
                                                {agents.map(agent => (
                                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                                ))}
                                            </select>
                                            <button onClick={() => setIsAssigning(null)} className="text-red-500"><XCircle size={16} /></button>
                                        </div>
                                    ) : (
                                        client.agent ? client.agent.name : <span className="text-gray-400 italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    {client.isSuspended ? (
                                        <span className="bg-red-100 text-red-800 px-2.5 py-1 text-xs font-semibold" style={{ borderRadius: "4px" }}>Suspended</span>
                                    ) : (
                                        <span className="bg-green-100 text-green-800 px-2.5 py-1 text-xs font-semibold" style={{ borderRadius: "4px" }}>Active</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            className="p-1.5 text-gray-500 hover:text-blue-800 transition-colors flex items-center disabled:opacity-50"
                                            title={client.isSuspended ? "Cannot assign agent to suspended client" : "Assign/Reassign Agent"}
                                            disabled={client.isSuspended}
                                            onClick={() => setIsAssigning(client.id)}
                                        >
                                            <Replace size={16} />
                                        </button>

                                        <button
                                            className={`p-1.5 transition-colors ${client.isSuspended ? "text-red-500 hover:text-green-500" : "text-gray-500 hover:text-orange-500"}`}
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
                                <td colSpan={5} className="px-4 py-10 text-center text-gray-400 italic font-medium">No clients found matching your search.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
