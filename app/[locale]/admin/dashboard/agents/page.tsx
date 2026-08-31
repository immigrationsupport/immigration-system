import React from "react";
import { Role } from "@prisma/client";
import { Search, Edit2, Ban, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CreateAgentModal from "./create-agent-modal";
import AgentActionButtons from "./agent-actions";
import { TruncatedText } from "@/components/ui/truncated-text";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ManageAgentsPage() {
    const t = await getTranslations("adminAgents");
    const session = await auth.api.getSession({ headers: await headers() });
    const agencyId = (session?.user as any)?.agencyId;

    if (!agencyId) {
        return (
            <div className="max-w-7xl mx-auto p-8 text-center text-gray-500">
                {t("noAgencyLinked")}
            </div>
        );
    }

    // Fetch real agent data securely from DB, scoped to this agency
    const agents =
        await prisma.user.findMany({
            where: { role: Role.AGENT, agencyId },
            include: {
                assignedClients: { select: { id: true } }
            },
            orderBy: { createdAt: "desc" }
        });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold" style={{ color: "#1E3A8A" }}>{t("pageTitle")}</h1>
                {/* Embedded the new Create Agent Modal Form here */}
                <CreateAgentModal />
            </div>

            <div className="bg-[#F9FAFB] p-6 lg:p-8 shadow-sm border border-gray-200 rounded-xl">
                <div className="flex gap-4 mb-6 relative w-full md:w-1/2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#374151]" />
                    <Input placeholder={t("searchPlaceholder")} className="pl-12 h-12 text-[16px] bg-white border-gray-300 placeholder-[#6B7280] rounded-xl" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-100/80">
                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 first:rounded-tl-xl">{t("colAgentName")}</th>
                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">{t("colEmail")}</th>
                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-center">{t("colAssignedClients")}</th>
                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">{t("colStatus")}</th>
                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-right last:rounded-tr-xl">{t("colActions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {agents.length > 0 ? (
                                agents.map((agent: any) => (
                                    <tr key={agent.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                        <td className="px-6 py-5">
                                             <div className="flex items-center gap-4">
                                                 <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[14px] font-extrabold text-[#1E3A8A] border border-blue-200">
                                                     {agent.name.substring(0, 2).toUpperCase()}
                                                 </div>
                                                 <span className="text-[16px] lg:text-[18px] font-extrabold text-[#111827]">
                                                     <TruncatedText text={agent.name} maxLength={25} />
                                                 </span>
                                             </div>
                                         </td>
                                         <td className="px-6 py-5 text-[16px] lg:text-[18px] font-bold text-[#374151]">
                                             <TruncatedText text={agent.email} maxLength={30} />
                                         </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center justify-center h-8 px-4 rounded-full bg-gray-100 text-[#374151] text-[14px] font-extrabold border border-gray-200">
                                                {agent.assignedClients.length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[14px] font-extrabold uppercase tracking-tight ${
                                                agent.isSuspended 
                                                ? "bg-red-50 text-red-600 border border-red-200" 
                                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                            }`}>
                                                {agent.isSuspended ? t("statusSuspended") : t("statusActive")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
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
                                    <td colSpan={5} className="px-6 py-16 text-center text-[#6B7280] font-extrabold uppercase tracking-widest text-[16px]">
                                        {t("noAgentsFound")}
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