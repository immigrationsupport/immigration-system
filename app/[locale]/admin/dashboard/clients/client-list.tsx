"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    Ban,
    Replace,
    XCircle,
    Trash2,
    CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    assignAgentToClientAction,
    toggleSuspendClientAction,
    deleteClientAction
} from "./actions";
import { TruncatedText } from "@/components/ui/truncated-text";
import CreateClientModal from "./create-client-modal";
import EditClientModal from "./edit-client-modal";
import { useTranslations } from "next-intl";
import { TablePagination } from "@/components/ui/table-pagination";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { toast } from "sonner";

const PAGE_SIZE = 10;

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
    initialClients: Client[];
    agents: Agent[];
}

export default function ClientList({
    initialClients,
    agents
}: ClientListProps) {
    const t = useTranslations("adminClients");

    const [clients, setClients] = useState<Client[]>(initialClients);
    const [search, setSearch] = useState("");
    const [isAssigning, setIsAssigning] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [deletingClient, setDeletingClient] = useState<Client | null>(null);
    const [suspendingClient, setSuspendingClient] = useState<Client | null>(null);
    const [actionError, setActionError] = useState("");
    const [isPendingAction, setIsPendingAction] = useState(false);

    // Filter clients based on search query (name or email)
    const filteredClients = useMemo(() => {
        return clients.filter(
            (client) =>
                client.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                client.email
                    .toLowerCase()
                    .includes(search.toLowerCase())
        );
    }, [clients, search]);

    // Reset pagination whenever the search changes.
    useEffect(() => {
        setPage(1);
    }, [search]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredClients.length / PAGE_SIZE)
    );

    const safePage = Math.min(page, totalPages);

    const paginatedClients = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredClients.slice(start, start + PAGE_SIZE);
    }, [filteredClients, safePage]);

    const handleAssign = async (
        clientId: string,
        agentId: string
    ) => {
        const res = await assignAgentToClientAction(
            clientId,
            agentId
        );

        if (res.error) {
            toast.error(res.error);
            return;
        }

        const selectedAgent =
            agents.find((agent) => agent.id === agentId) || null;

        setClients((prev) =>
            prev.map((client) =>
                client.id === clientId
                    ? {
                          ...client,
                          agentId,
                          agent: selectedAgent
                      }
                    : client
            )
        );

        setIsAssigning(null);
        toast.success(t("toastAssignSuccess"));
    };

    const handleToggleSuspendConfirm = async () => {
        if (!suspendingClient) return;
        setIsPendingAction(true);
        setActionError("");

        const res = await toggleSuspendClientAction(
            suspendingClient.id,
            suspendingClient.isSuspended
        );

        setIsPendingAction(false);

        if (res.error) {
            setActionError(res.error);
            toast.error(res.error);
            return;
        }

        setClients((prev) =>
            prev.map((client) =>
                client.id === suspendingClient.id
                    ? {
                          ...client,
                          isSuspended: !suspendingClient.isSuspended
                      }
                    : client
            )
        );

        toast.success(
            suspendingClient.isSuspended
                ? t("toastUnsuspended")
                : t("toastSuspended")
        );
        setSuspendingClient(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingClient) return;
        setIsPendingAction(true);
        setActionError("");

        const res = await deleteClientAction(deletingClient.id);

        setIsPendingAction(false);

        if (res.error) {
            setActionError(res.error);
            toast.error(res.error);
            return;
        }

        setClients((prev) =>
            prev.filter((client) => client.id !== deletingClient.id)
        );

        toast.success(t("toastDeleteSuccess"));
        setDeletingClient(null);
    };

    return (
        <div className="space-y-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1
                    className="text-2xl font-semibold"
                    style={{ color: "#1E3A8A" }}
                >
                    {t("pageTitle")}
                </h1>

                <CreateClientModal
                    agents={agents}
                    onClientCreated={(newClient) => {
                        setClients((prev) => [
                            newClient,
                            ...prev
                        ]);
                        setPage(1);
                    }}
                />
            </div>

            <div
                className="bg-[#F9FAFB] p-6 lg:p-8 shadow-sm border border-gray-200"
                style={{ borderRadius: "8px" }}
            >
                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1 md:w-1/2">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#374151]" />

                        <Input
                            placeholder={t("searchPlaceholder")}
                            className="pl-12 h-12 bg-white border-gray-300 text-[16px] placeholder-[#6B7280]"
                            style={{ borderRadius: "8px" }}
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-100/80">
                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 first:rounded-tl-xl whitespace-nowrap">
                                    {t("colClientName")}
                                </th>

                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">
                                    {t("colEmail")}
                                </th>

                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">
                                    {t("colAssignedAgent")}
                                </th>

                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 whitespace-nowrap">
                                    {t("colStatus")}
                                </th>

                                <th className="px-6 py-5 text-[14px] lg:text-[16px] font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-right last:rounded-tr-xl">
                                    {t("colActions")}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {paginatedClients.map((client) => (
                                <tr
                                    key={client.id}
                                    className="hover:bg-blue-50/40 transition-all duration-200 group"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[14px] font-bold text-[#1E3A8A]">
                                                {client.name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </div>

                                            <span className="font-extrabold text-[16px] lg:text-[18px] text-[#111827]">
                                                <TruncatedText
                                                    text={client.name}
                                                    maxLength={20}
                                                />
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-[#374151] font-semibold text-[16px] lg:text-[18px]">
                                        <TruncatedText
                                            text={client.email}
                                            maxLength={25}
                                        />
                                    </td>

                                    <td className="px-6 py-5 max-w-[200px] truncate text-[16px] lg:text-[18px]">
                                        {isAssigning === client.id ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="border border-gray-300 rounded px-3 py-2 text-[16px] bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all min-w-[120px] max-w-[180px] truncate"
                                                    defaultValue={
                                                        client.agentId || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleAssign(
                                                            client.id,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option
                                                        value=""
                                                        disabled
                                                    >
                                                        {t("selectAgent")}
                                                    </option>

                                                    {agents.map(
                                                        (agent) => (
                                                            <option
                                                                key={
                                                                    agent.id
                                                                }
                                                                value={
                                                                    agent.id
                                                                }
                                                            >
                                                                {agent.name.length >
                                                                20
                                                                    ? agent.name.substring(
                                                                          0,
                                                                          20
                                                                      ) + "..."
                                                                    : agent.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                                <button
                                                    onClick={() =>
                                                        setIsAssigning(
                                                            null
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-600 transition-colors"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {client.agent ? (
                                                    <span
                                                        className="font-bold text-[#374151] max-w-[150px] truncate block"
                                                        title={
                                                            client.agent.name
                                                        }
                                                    >
                                                        {
                                                            client.agent
                                                                .name
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="text-[14px] font-bold uppercase tracking-tighter text-gray-400 italic">
                                                        {t("unassigned")}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-2">
                                            <span
                                                className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-tight w-max ${
                                                    client.isSuspended
                                                        ? "bg-red-100 text-red-800 border-red-200"
                                                        : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                }`}
                                            >
                                                {client.isSuspended
                                                    ? t(
                                                          "statusSuspended"
                                                      )
                                                    : t(
                                                          "statusActive"
                                                      )}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                                            <EditClientModal
                                                clientId={client.id}
                                                currentName={client.name}
                                                currentEmail={client.email}
                                                onClientUpdated={({
                                                    id,
                                                    name,
                                                    email
                                                }) => {
                                                    setClients((prev) =>
                                                        prev.map((c) =>
                                                            c.id === id
                                                                ? {
                                                                      ...c,
                                                                      name,
                                                                      email
                                                                  }
                                                                : c
                                                        )
                                                    );
                                                }}
                                            />

                                            <button
                                                className="p-2 text-[#374151] hover:text-[#1E3A8A] hover:bg-white rounded-lg transition-all disabled:opacity-50"
                                                title={
                                                    client.isSuspended
                                                        ? t(
                                                              "assignTooltipDisabled"
                                                          )
                                                        : t(
                                                              "assignTooltip"
                                                          )
                                                }
                                                disabled={
                                                    client.isSuspended
                                                }
                                                onClick={() =>
                                                    setIsAssigning(
                                                        client.id
                                                    )
                                                }
                                            >
                                                <Replace size={20} />
                                            </button>

                                            <button
                                                className={`p-2 rounded-lg transition-all bg-white ${
                                                    client.isSuspended
                                                        ? "text-emerald-600 hover:bg-emerald-50"
                                                        : "text-amber-500 hover:bg-amber-50"
                                                }`}
                                                title={
                                                    client.isSuspended
                                                        ? t(
                                                              "unsuspendTooltip"
                                                          )
                                                        : t(
                                                              "suspendTooltip"
                                                          )
                                                }
                                                onClick={() => {
                                                    setActionError("");
                                                    setSuspendingClient(client);
                                                }}
                                            >
                                                {client.isSuspended ? (
                                                    <CheckCircle2 size={20} />
                                                ) : (
                                                    <Ban size={20} />
                                                )}
                                            </button>

                                            <button
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all bg-white"
                                                title={t(
                                                    "deleteTooltip"
                                                )}
                                                onClick={() => {
                                                    setActionError("");
                                                    setDeletingClient(client);
                                                }}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredClients.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-16 text-center text-gray-400 font-semibold"
                                    >
                                        {t("noClients")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredClients.length > PAGE_SIZE && (
                    <div className="pt-6">
                        <TablePagination
                            page={safePage}
                            totalItems={filteredClients.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            {/* Delete Client Confirmation Dialog (with Typed Name) */}
            {deletingClient && (
                <ConfirmActionDialog
                    open={!!deletingClient}
                    onOpenChange={(open) => !open && setDeletingClient(null)}
                    onConfirm={handleDeleteConfirm}
                    title={t("confirmDelete")}
                    description={`This will permanently delete "${deletingClient.name}" (${deletingClient.email}) and all their uploaded documents. This action cannot be undone.`}
                    confirmTargetName={deletingClient.name}
                    confirmButtonText={t("confirmDelete")}
                    actionType="delete"
                    variant="danger"
                    isPending={isPendingAction}
                    error={actionError}
                />
            )}

            {/* Suspend Client Confirmation Dialog (with Typed Name) */}
            {suspendingClient && (
                <ConfirmActionDialog
                    open={!!suspendingClient}
                    onOpenChange={(open) => !open && setSuspendingClient(null)}
                    onConfirm={handleToggleSuspendConfirm}
                    title={
                        suspendingClient.isSuspended
                            ? t("confirmUnsuspend")
                            : t("confirmSuspend")
                    }
                    description={
                        suspendingClient.isSuspended
                            ? `This will restore platform access for "${suspendingClient.name}".`
                            : `This will block "${suspendingClient.name}" from logging in to check their procedures.`
                    }
                    confirmTargetName={suspendingClient.name}
                    confirmButtonText={
                        suspendingClient.isSuspended
                            ? t("confirmUnsuspend")
                            : t("confirmSuspend")
                    }
                    actionType="suspend"
                    variant="warning"
                    isPending={isPendingAction}
                    error={actionError}
                />
            )}
        </div>
    );
}