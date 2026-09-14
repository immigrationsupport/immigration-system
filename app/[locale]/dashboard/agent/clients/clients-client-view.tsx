"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Filter, UserPlus, Mail, FileText, Users, CheckCircle, AlertCircle, Clock, Ban } from "lucide-react";
import ApplicationList from "../applications/application-list";
import SendIntakeFormButton from "./[id]/send-intake-form-button";
import NewApplicationModal from "./[id]/new-application-modal";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface Application {
    id: string;
    type: string;
    country: string;
    status: string;
    updatedAt: Date | string;
    clientId: string;
    client: {
        name: string;
        email: string;
    };
    steps: any[];
}

interface ClientWithoutProcedure {
    id: string;
    name: string;
    email: string;
}

interface ClientsClientViewProps {
    applications: Application[];
    clientsWithoutProcedure: ClientWithoutProcedure[];
}

type SectionFilter = "all" | "procedures" | "no_procedure";
type StatusFilter = "ALL" | "IN_REVIEW" | "APPROVED" | "PENDING" | "REJECTED";

export default function ClientsClientView({
    applications,
    clientsWithoutProcedure,
}: ClientsClientViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

    // Filter applications based on search & status
    const filteredApplications = useMemo(() => {
        if (sectionFilter === "no_procedure") return [];

        return applications.filter((app) => {
            // Status match
            if (statusFilter !== "ALL" && app.status !== statusFilter) {
                return false;
            }

            // Search query match
            if (!searchQuery.trim()) return true;

            const query = searchQuery.toLowerCase().trim();
            const clientName = app.client?.name?.toLowerCase() || "";
            const clientEmail = app.client?.email?.toLowerCase() || "";
            const appType = app.type?.toLowerCase() || "";
            const appCountry = app.country?.toLowerCase() || "";
            const appStatus = app.status?.toLowerCase() || "";

            return (
                clientName.includes(query) ||
                clientEmail.includes(query) ||
                appType.includes(query) ||
                appCountry.includes(query) ||
                appStatus.includes(query)
            );
        });
    }, [applications, searchQuery, statusFilter, sectionFilter]);

    // Filter clients without procedure based on search
    const filteredClientsWithoutProcedure = useMemo(() => {
        if (sectionFilter === "procedures") return [];
        if (statusFilter !== "ALL") return []; // Clients without procedure don't have an application status

        return clientsWithoutProcedure.filter((client) => {
            if (!searchQuery.trim()) return true;

            const query = searchQuery.toLowerCase().trim();
            const name = client.name?.toLowerCase() || "";
            const email = client.email?.toLowerCase() || "";

            return name.includes(query) || email.includes(query);
        });
    }, [clientsWithoutProcedure, searchQuery, statusFilter, sectionFilter]);

    const hasActiveFilters = searchQuery.trim() !== "" || sectionFilter !== "all" || statusFilter !== "ALL";

    const resetFilters = () => {
        setSearchQuery("");
        setSectionFilter("all");
        setStatusFilter("ALL");
    };

    return (
        <div className="space-y-8">
            {/* Search Bar & Filters Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Rechercher par nom de client, email, type de procédure ou pays..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-10 py-6 rounded-2xl border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Quick Clear Button if active filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-3 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                        >
                            <X className="h-3.5 w-3.5" /> Réinitialiser les filtres
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                            <Filter className="h-3.5 w-3.5" /> Vue:
                        </span>
                        <button
                            onClick={() => setSectionFilter("all")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                sectionFilter === "all"
                                    ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-900/10"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Tous ({applications.length + clientsWithoutProcedure.length})
                        </button>
                        <button
                            onClick={() => setSectionFilter("procedures")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                sectionFilter === "procedures"
                                    ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-900/10"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Procédures en cours ({applications.length})
                        </button>
                        <button
                            onClick={() => setSectionFilter("no_procedure")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                sectionFilter === "no_procedure"
                                    ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-900/10"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Clients sans procédure ({clientsWithoutProcedure.length})
                        </button>
                    </div>

                    {/* Status Dropdown / Filter (only applicable for procedures) */}
                    {sectionFilter !== "no_procedure" && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Statut:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                className="bg-gray-100 border border-transparent rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:bg-white focus:border-gray-300 focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">Tous les statuts</option>
                                <option value="IN_REVIEW">En cours d'examen</option>
                                <option value="APPROVED">Approuvés</option>
                                <option value="PENDING">En attente</option>
                                <option value="REJECTED">Refusés</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {sectionFilter !== "no_procedure" && (
                <div className="space-y-4">
                    {filteredApplications.length > 0 ? (
                        <ApplicationList initialApplications={filteredApplications} />
                    ) : sectionFilter === "procedures" ? (
                        <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-3">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center mx-auto">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="font-extrabold text-gray-800 text-lg">Aucune procédure ne correspond à votre recherche</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                Essayez de modifier vos termes de recherche ou de réinitialiser le filtre de statut.
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="text-xs font-bold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors inline-block mt-2"
                                >
                                    Effacer les filtres
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Clients without Procedure Section */}
            {sectionFilter !== "procedures" && statusFilter === "ALL" && (
                <>
                    {filteredClientsWithoutProcedure.length > 0 ? (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 pt-2">
                                <UserPlus className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-black text-gray-700">
                                    Clients sans procédure ({filteredClientsWithoutProcedure.length})
                                </h2>
                            </div>
                            <p className="text-sm text-gray-400 -mt-2">
                                Ces clients n'ont pas encore de procédure en cours — envoyez-leur le formulaire de renseignement ou créez-en une directement.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredClientsWithoutProcedure.map((client) => (
                                    <div
                                        key={client.id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-black shrink-0">
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

                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                            <SendIntakeFormButton clientId={client.id} />
                                            <NewApplicationModal clientId={client.id} clientName={client.name} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : sectionFilter === "no_procedure" ? (
                        <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-3">
                            <div className="h-12 w-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="font-extrabold text-gray-800 text-lg">Aucun client sans procédure ne correspond</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                Aucun client sans procédure active n'a été trouvé pour vos critères.
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="text-xs font-bold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors inline-block mt-2"
                                >
                                    Effacer les filtres
                                </button>
                            )}
                        </div>
                    ) : null}
                </>
            )}

            {/* Global Empty State when filters return zero total items */}
            {filteredApplications.length === 0 && filteredClientsWithoutProcedure.length === 0 && sectionFilter === "all" && (
                <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center mx-auto">
                        <Search className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-extrabold text-gray-900 text-xl">Aucun résultat trouvé</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Aucune procédure ni client ne correspond à votre recherche "{searchQuery}".
                        </p>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="text-sm font-bold text-white bg-[#1E3A8A] hover:bg-blue-900 px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-900/10 inline-block"
                    >
                        Réinitialiser la recherche
                    </button>
                </div>
            )}
        </div>
    );
}
