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

            <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-gray-200 bg-[#F9FAFB]">
                    <h2 className="text-[18px] lg:text-[20px] font-extrabold flex items-center gap-2 text-[#1E3A8A]">
                        <Users className="h-6 w-6 text-blue-600" />
                        My Clients
                    </h2>
                </div>
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-gray-100/80">
                                    <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 first:rounded-tl-xl whitespace-nowrap">Client Detail</th>
                                    <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Latest Application</th>
                                    <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">Documents</th>
                                    <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-right last:rounded-tr-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {clients.map((client) => {
                                    const latestApp = client.applications[0];
                                    return (
                                        <tr key={client.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1E3A8A] font-extrabold text-[14px]">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-[16px] lg:text-[18px] font-extrabold text-[#111827] group-hover:text-blue-900 transition-colors mb-1">{client.name}</div>
                                                        <div className="text-[14px] text-[#374151] font-bold flex items-center gap-1.5">
                                                            <Mail className="h-4 w-4 text-[#6B7280]" /> {client.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[#374151] font-mono text-[16px] lg:text-[18px] font-bold">
                                                    {latestApp ? latestApp.id.substring(0, 8).toUpperCase() : "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-4 py-1.5 rounded-full text-[14px] font-extrabold uppercase tracking-tight ${latestApp?.status === "APPROVED" ? "bg-green-100 text-green-700 border border-green-200" :
                                                        latestApp?.status === "REJECTED" ? "bg-red-100 text-red-700 border border-red-200" :
                                                            latestApp?.status === "IN_REVIEW" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                                                                latestApp ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-500 border border-gray-200"
                                                    }`}>
                                                    {latestApp ? latestApp.status.replace(/_/g, " ") : "No Application"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-[#374151]">
                                                    <span className="text-[16px] lg:text-[18px] font-extrabold">{client._count.documents}</span>
                                                    <span className="text-[14px] font-extrabold text-[#6B7280]">files</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link href={`/dashboard/agent/clients/${client.id}`}>
                                                    <Button variant="outline" className="h-12 px-6 gap-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-[#374151] hover:text-[#1E3A8A] font-extrabold rounded-md transition-all text-[14px]">
                                                        <Eye className="h-5 w-5" /> View Profile
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-24 text-center">
                                            <UserX className="h-16 w-16 text-[#6B7280] mx-auto mb-4 opacity-30" />
                                            <h3 className="text-[18px] text-[#111827] font-extrabold">No clients assigned yet</h3>
                                            <p className="text-[16px] text-[#6B7280] max-w-sm mx-auto mt-2 font-bold">When an administrator assigns clients to you, they will appear here.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
