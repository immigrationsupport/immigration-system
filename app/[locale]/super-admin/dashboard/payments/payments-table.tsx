"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Building2, Search } from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 10;

interface PaymentRow {
    id: string;
    amountFcfa: number;
    method: "MTN_MOBILE_MONEY" | "ORANGE_MONEY" | "CARD" | null;
    status: "PENDING" | "SUCCESS" | "FAILED";
    reference: string | null;
    createdAt: string;
    subscription: {
        agency: {
            id: string;
            name: string;
            isInternal: boolean;
        };
        plan: {
            id: string;
            name: string;
            slug: string;
        };
    };
}

const STATUS_STYLES: Record<string, string> = {
    SUCCESS:
        "bg-green-100 text-green-700 border border-green-200",
    PENDING:
        "bg-amber-100 text-amber-700 border border-amber-200",
    FAILED:
        "bg-red-100 text-red-700 border border-red-200",
};

export default function PaymentsTable({
    payments,
}: {
    payments: PaymentRow[];
}) {
    const t = useTranslations("superAdminDashboard.paymentsPage");
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("ALL");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        return payments.filter((p) => {
            if (status !== "ALL" && p.status !== status) {
                return false;
            }

            if (!query.trim()) {
                return true;
            }

            const q = query.trim().toLowerCase();

            return (
                p.subscription.agency.name
                    .toLowerCase()
                    .includes(q) ||
                p.subscription.plan.name
                    .toLowerCase()
                    .includes(q) ||
                (p.reference || "")
                    .toLowerCase()
                    .includes(q)
            );
        });
    }, [payments, query, status]);

    useEffect(() => {
        setPage(1);
    }, [query, status]);

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / PAGE_SIZE)
    );

    const safePage = Math.min(page, totalPages);

    const paginatedPayments = filtered.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    return (
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-gray-200 bg-white">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                    <Input
                        value={query}
                        onChange={(e) =>
                            setQuery(e.target.value)
                        }
                        placeholder={t("searchPlaceholder")}
                        className="pl-9"
                    />
                </div>

                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value)
                    }
                    className="text-sm font-bold border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] bg-white"
                >
                    <option value="ALL">
                        {t("allStatuses")}
                    </option>
                    <option value="SUCCESS">
                        {t("statusLabels.SUCCESS")}
                    </option>
                    <option value="PENDING">
                        {t("statusLabels.PENDING")}
                    </option>
                    <option value="FAILED">
                        {t("statusLabels.FAILED")}
                    </option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-100/80">
                            <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                {t("columns.agency")}
                            </th>

                            <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                {t("columns.plan")}
                            </th>

                            <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                {t("columns.amount")}
                            </th>

                            <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                {t("columns.method")}
                            </th>

                            <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                {t("columns.reference")}
                            </th>

                            <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                {t("columns.date")}
                            </th>

                            <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">
                                {t("columns.status")}
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedPayments.map((p) => (
                            <tr
                                key={p.id}
                                className="hover:bg-blue-50/40 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 font-bold text-gray-900">
                                        <Building2 className="h-4 w-4 text-gray-400" />

                                        {p.subscription.agency.name}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-gray-700 font-semibold">
                                    {p.subscription.plan.name}
                                </td>

                                <td className="px-6 py-4 text-gray-900 font-bold">
                                    {p.amountFcfa.toLocaleString()} FCFA
                                </td>

                                <td className="px-6 py-4 text-gray-700 font-semibold">
                                    {p.method ? (
                                        t.has(`methods.${p.method}`) ? t(`methods.${p.method}`) : p.method
                                    ) : (
                                        <span className="text-gray-300">
                                            —
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                    {p.reference || "—"}
                                </td>

                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(
                                        p.createdAt
                                    ).toLocaleString()}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                                            STATUS_STYLES[
                                                p.status
                                            ]
                                        }`}
                                    >
                                        {t.has(`statusLabels.${p.status}`) ? t(`statusLabels.${p.status}`) : p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-6 py-16 text-center text-gray-400 font-semibold"
                                >
                                    {t("empty")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filtered.length > PAGE_SIZE && (
                <div className="px-6 pb-6">
                    <TablePagination
                        page={safePage}
                        totalItems={filtered.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}