import React from "react";
import { Role } from "@prisma/client";
import { Search, Edit2, Ban, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";
import CreateAgentModal from "./create-agent-modal";
import AgentActionButtons from "./agent-actions";

export default async function ManageAgentsPage() {
    // Fetch real agent data securely from DB
    const agents =
        await prisma.user.findMany({
            where: { role: Role.AGENT },
            include: {
                assignedClients: { select: { id: true } }
            },
            orderBy: { createdAt: "desc" }
        });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold" style={{ color: "#1E3A8A" }}>Manage Agents</h1>
                {/* Embedded the new Create Agent Modal Form here */}
                <CreateAgentModal />
            </div>

            <div className="bg-white p-6 shadow-sm border border-gray-100" style={{ borderRadius: "8px" }}>
                <div className="flex gap-4 mb-6 relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search agents..." className="pl-9 h-10 bg-gray-50 border-gray-200" style={{ borderRadius: "8px" }} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50/80">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 first:rounded-tl-xl">Agent Name</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 text-center">Assigned Clients</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 text-right last:rounded-tr-xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {agents.length > 0 ? (
                                agents.map((agent: any) => (
                                    <tr key={agent.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-[#1E3A8A]">
                                                    {agent.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-900">{agent.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">{agent.email}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center h-7 px-3 rounded-full bg-gray-100 text-gray-700 text-xs font-black">
                                                {agent.assignedClients.length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                                agent.isSuspended 
                                                ? "bg-red-50 text-red-600 border border-red-100" 
                                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            }`}>
                                                {agent.isSuspended ? "Suspended" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <AgentActionButtons 
                                                agentId={agent.id} 
                                                agentName={agent.name} 
                                                agentEmail={agent.email} 
                                                isSuspended={agent.isSuspended} 
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                        No agents found. Click "Create Agent" to start.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
