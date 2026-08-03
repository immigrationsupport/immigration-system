import React from "react";
import { getAgencies } from "./actions";
import AgencyList from "./agency-list";

export const dynamic = "force-dynamic";

export default async function SuperAdminAgenciesPage() {
    const agencies = await getAgencies();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#1E3A8A" }}>Agencies</h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage every agency on the platform.</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-blue-700 text-sm font-semibold">{agencies.length} Total Agencies</span>
                </div>
            </div>

            <AgencyList initialAgencies={agencies as any} />
        </div>
    );
}