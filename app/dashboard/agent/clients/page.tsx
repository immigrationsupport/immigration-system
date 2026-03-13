import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Phone, Eye, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function AssignedClientsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "AGENT") {
        return null; // Handled by middleware mostly
    }

    const clients = await prisma.user.findMany({
        where: { agentId: session.user.id },
        include: {
            applications: {
                orderBy: { updatedAt: "desc" },
                take: 1,
            },
            _count: {
                select: { documents: true }
            }
        },
        orderBy: { name: "asc" }
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900" style={{ color: "#1E3A8A" }}>Assigned Clients</h1>
                    <p className="text-gray-500 mt-1">Manage individuals currently assigned to your care.</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#1E3A8A]" />
                    <span className="text-sm font-bold text-[#1E3A8A]">{clients.length} Active Clients</span>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 py-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <Users className="h-5 w-5 text-blue-600" />
                        Client Roster
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Client Detail</th>
                                    <th className="px-6 py-4">Application ID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Documents</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {clients.map((client) => {
                                    const latestApp = client.applications[0];
                                    return (
                                        <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                        {client.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 group-hover:text-blue-900 transition-colors">{client.name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" /> {client.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-gray-600 font-mono text-xs">
                                                    {latestApp ? latestApp.id.substring(0, 8).toUpperCase() : "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${latestApp?.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                        latestApp?.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                            latestApp?.status === "IN_REVIEW" ? "bg-yellow-100 text-yellow-700" :
                                                                latestApp ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                    {latestApp ? latestApp.status.replace(/_/g, " ") : "No Application"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <span className="font-bold">{client._count.documents}</span>
                                                    <span className="text-xs">files</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link href={`/dashboard/agent/clients/${client.id}`}>
                                                    <Button variant="outline" className="h-9 gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-700 font-bold rounded-xl transition-all">
                                                        <Eye className="h-4 w-4" /> View Profile
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <UserX className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                            <h3 className="text-gray-900 font-bold">No clients assigned yet</h3>
                                            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">When an administrator assigns clients to you, they will appear here in your roster.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
