import React from "react";
import { Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ApplicationList from "../applications/application-list";
import NewClientButton from "./new-client-button";
import SendIntakeFormButton from "./[id]/send-intake-form-button";
import NewApplicationModal from "./[id]/new-application-modal";
import Link from "next/link";
import { UserPlus, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AssignedClientsPage() {
    const t = await getTranslations("agents");
    const tClients = await getTranslations("clients");

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 font-medium">{t("signInAsAgent")}</p>
            </div>
        );
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    const agencyId = (session.user as any).agencyId;

    // Applications (procedures) — this stays the main content of the page,
    // same query/scoping the old /applications page used.
    const applications = await prisma.application.findMany({
        where: isAdmin ? { agencyId } : {
            OR: [
                { agentId: session.user.id },
                { client: { agentId: session.user.id } }
            ]
        },
        include: {
            client: {
                select: {
                    name: true,
                    email: true
                }
            },
            steps: {
                include: {
                    Document: true
                }
            }
        },
        orderBy: {
            updatedAt: "desc"
        }
    });

    // Total clients — just a count now, the old page's full client table
    // (with per-client suspend/reassign actions) has been folded into this
    // single card + the "New client" button.
    const totalClients = await prisma.user.count({
        where: isAdmin
            ? { role: "CLIENT", agencyId }
            : { role: "CLIENT", agentId: session.user.id }
    });

    // Clients with zero procedures — invisible on the ApplicationList above
    // (which is procedure-centric), so agents previously could only find
    // them via the client dropdown inside "New Procedure". Surfaced here
    // so they're not lost.
    const clientsWithoutProcedure = await prisma.user.findMany({
        where: {
            role: "CLIENT",
            ...(isAdmin ? { agencyId } : { agentId: session.user.id }),
            applications: { none: {} }
        },
        select: { id: true, name: true, email: true },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-4 border-gray-100 gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#1E3A8A" }}>{t("agentWorkspace")}</h1>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{t("manageUpdate")}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100 flex items-center gap-2">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        {t("activeProcedures", { count: applications.length })}
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                        <Users className="h-5 w-5 text-[#1E3A8A]" />
                        <span className="font-bold text-[#1E3A8A]">
                            {totalClients} {tClients("activeClients")}
                        </span>
                    </div>

                    <NewClientButton isAgent={!isAdmin} />
                </div>
            </div>

            <ApplicationList initialApplications={applications} />

            {clientsWithoutProcedure.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pt-2">
                        <UserPlus className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-black text-gray-700">
                            Clients sans procédure ({clientsWithoutProcedure.length})
                        </h2>
                    </div>
                    <p className="text-sm text-gray-400 -mt-2">
                        Ces clients n'ont pas encore de procédure en cours — envoyez-leur le formulaire de renseignement ou créez-en une directement.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clientsWithoutProcedure.map((client) => (
                            <div
                                key={client.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black shrink-0">
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <Link
                                            href={`/dashboard/agent/clients/${client.id}`}
                                            className="font-bold text-gray-900 hover:text-[#1E3A8A] transition-colors truncate block"
                                        >
                                            {client.name}
                                        </Link>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                                            <Mail className="h-3 w-3 shrink-0" /> {client.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <SendIntakeFormButton clientId={client.id} />
                                    <NewApplicationModal clientId={client.id} clientName={client.name} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}