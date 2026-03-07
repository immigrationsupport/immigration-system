import React from "react";
import { Search, Edit2, Ban, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";
import CreateAgentModal from "./create-agent-modal";

export default async function ManageAgentsPage() {
    // Fetch real agent data securely from DB
    const agents = await prisma.user.findMany({
        where: { role: "AGENT" as any },
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
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 font-medium">Agent Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Assigned Clients</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {agents.length > 0 ? (
                                agents.map(agent => (
                                    <tr key={agent.id} className="hover:bg-gray-50 transition-colors bg-white">
                                        <td className="px-4 py-4 font-medium text-gray-900 border-l-2 border-transparent hover:border-blue-800">
                                            {agent.name}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">{agent.email}</td>
                                        <td className="px-4 py-4 text-gray-900 font-semibold">{agent.assignedClients.length}</td>
                                        <td className="px-4 py-4">
                                            <span className="bg-green-100 text-green-800 px-2.5 py-1 text-xs font-semibold" style={{ borderRadius: "4px" }}>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1.5 text-gray-500 hover:text-blue-800 transition-colors" title="Edit Agent">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-500 hover:text-orange-500 transition-colors" title="Suspend Agent">
                                                    <Ban size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-500 hover:text-red-500 transition-colors" title="Delete Agent">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                                        No agents found. Click "Create Agent" to add the first agent.
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
