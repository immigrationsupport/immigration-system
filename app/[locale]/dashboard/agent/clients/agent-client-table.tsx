"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TablePagination } from "@/components/ui/table-pagination";
import { TruncatedText } from "@/components/ui/truncated-text";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 10;

interface AgentClient {
    id: string;
    name: string;
    email: string;
    isSuspended: boolean;
    applications: {
        id: string;
        status: string;
        updatedAt: Date | string;
        template?: {
            name: string;
        } | null;
    }[];
    _count: {
        documents: number;
    };
}

interface AgentClientTableProps {
    clients: AgentClient[];
}

export default function AgentClientTable({
    clients
}: AgentClientTableProps) {
    const t = useTranslations("clients");

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const filteredClients = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return clients;
        }

        return clients.filter((client) => {
            const latestApplication = client.applications[0];

            return (
                client.name.toLowerCase().includes(search) ||
                client.email.toLowerCase().includes(search) ||
                (latestApplication?.template?.name ?? "")
                    .toLowerCase()
                    .includes(search) ||
                (latestApplication?.status ?? "")
                    .toLowerCase()
                    .includes(search)
            );
        });
    }, [clients, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredClients.length / PAGE_SIZE)
    );

    const safePage = Math.min(page, totalPages);

    const paginatedClients = filteredClients.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    return (
        <>
            <div className="flex gap-4 mb-6 relative w-full md:w-1/2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#374151]" />

                <Input
                    placeholder="Search clients..."
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
                                Client Detail
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                Latest Procedure
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                Status
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-center">
                                Documents
                            </th>

                            <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-right last:rounded-tr-xl">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedClients.length > 0 ? (
                            paginatedClients.map((client) => {
                                const latestApplication =
                                    client.applications[0];

                                return (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-blue-50/40 transition-all duration-200"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[14px] font-extrabold text-[#1E3A8A] border border-blue-200">
                                                    {client.name
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <div className="text-[16px] lg:text-[18px] font-extrabold text-[#111827]">
                                                        <TruncatedText
                                                            text={client.name}
                                                            maxLength={25}
                                                        />
                                                    </div>

                                                    <div className="text-[14px] text-[#6B7280] font-medium mt-1">
                                                        <TruncatedText
                                                            text={client.email}
                                                            maxLength={30}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            {latestApplication ? (
                                                <div>
                                                    <div className="text-[16px] font-bold text-[#111827]">
                                                        <TruncatedText
                                                            text={
                                                                latestApplication
                                                                    .template
                                                                    ?.name ||
                                                                "Application"
                                                            }
                                                            maxLength={25}
                                                        />
                                                    </div>

                                                    <div className="text-[13px] text-[#6B7280] mt-1">
                                                        Updated{" "}
                                                        {new Date(
                                                            latestApplication.updatedAt
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[#9CA3AF] font-medium">
                                                    No procedure
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5">
                                            {latestApplication ? (
                                                <span
                                                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-extrabold uppercase tracking-tight ${
                                                        latestApplication.status ===
                                                        "APPROVED"
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                                            : latestApplication.status ===
                                                                "REJECTED"
                                                              ? "bg-red-50 text-red-600 border border-red-200"
                                                              : "bg-blue-50 text-blue-600 border border-blue-200"
                                                    }`}
                                                >
                                                    {latestApplication.status.replace(
                                                        /_/g,
                                                        " "
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-[#9CA3AF]">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center justify-center h-8 min-w-8 px-3 rounded-full bg-gray-100 text-[#374151] text-[14px] font-extrabold border border-gray-200">
                                                {client._count.documents}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <Link
                                                href={`/dashboard/agent/clients/${client.id}`}
                                            >
                                                <Button
                                                    type="button"
                                                    className="h-10 px-4"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-16 text-center text-[#6B7280] font-extrabold uppercase tracking-widest text-[16px]"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <Users className="h-10 w-10 text-gray-300" />
                                        <span>No clients found</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredClients.length > PAGE_SIZE && (
                <TablePagination
                    page={safePage}
                    totalItems={filteredClients.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                />
            )}
        </>
    );
}