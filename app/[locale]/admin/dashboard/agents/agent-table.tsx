"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TruncatedText } from "@/components/ui/truncated-text";
import { TablePagination } from "@/components/ui/table-pagination";
import AgentActionButtons from "./agent-actions";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 10;

interface Agent {
    id: string;
    name: string;
    email: string;
    isSuspended: boolean;
    assignedClients: {
        id: string;
    }[];
}

interface AgentTableProps {
    agents: Agent[];
}

export default function AgentTable({ agents }: AgentTableProps) {
    const t = useTranslations("adminAgents");

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const filteredAgents = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return agents;
        }

        return agents.filter(
            (agent) =>
                agent.name.toLowerCase().includes(search) ||
                agent.email.toLowerCase().includes(search)
        );
    }, [agents, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredAgents.length / PAGE_SIZE)
    );

    const safePage = Math.min(page, totalPages);

    const paginatedAgents = filteredAgents.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    return (
        <>
            <div className="flex gap-4 mb-6 relative w-full md:w-1/2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#374151]" />

                <Input
                    placeholder={t("searchPlaceholder")}
                    className="pl-12 h-12 text-[16px] bg-white border-gray-300 placeholder-[#6B7280] rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-100/80">
                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 first:rounded-tl-xl">
                                {t("colAgentName")}
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                {t("colEmail")}
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-center">
                                {t("colAssignedClients")}
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                {t("colStatus")}
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-right last:rounded-tr-xl">
                                {t("colActions")}
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedAgents.length > 0 ? (
                            paginatedAgents.map((agent) => (
                                <tr
                                    key={agent.id}
                                    className="hover:bg-blue-50/40 transition-all duration-200 group"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[14px] font-extrabold text-[#1E3A8A] border border-blue-200">
                                                {agent.name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </div>

                                            <span className="text-[16px] lg:text-[18px] font-extrabold text-[#111827]">
                                                <TruncatedText
                                                    text={agent.name}
                                                    maxLength={25}
                                                />
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-[16px] lg:text-[18px] font-bold text-[#374151]">
                                        <TruncatedText
                                            text={agent.email}
                                            maxLength={30}
                                        />
                                    </td>

                                    <td className="px-6 py-5 text-center">
                                        <span className="inline-flex items-center justify-center h-8 px-4 rounded-full bg-gray-100 text-[#374151] text-[14px] font-extrabold border border-gray-200">
                                            {agent.assignedClients.length}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5">
                                        <span
                                            className={`inline-flex items-center px-4 py-1.5 rounded-full text-[14px] font-extrabold uppercase tracking-tight ${
                                                agent.isSuspended
                                                    ? "bg-red-50 text-red-600 border border-red-200"
                                                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                            }`}
                                        >
                                            {agent.isSuspended
                                                ? t("statusSuspended")
                                                : t("statusActive")}
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
                                <td
                                    colSpan={5}
                                    className="px-6 py-16 text-center text-[#6B7280] font-extrabold uppercase tracking-widest text-[16px]"
                                >
                                    {t("noAgentsFound")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredAgents.length > PAGE_SIZE && (
                <TablePagination
                    page={safePage}
                    totalItems={filteredAgents.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                />
            )}
        </>
    );
}