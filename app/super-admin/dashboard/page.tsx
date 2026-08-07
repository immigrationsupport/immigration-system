import React from "react";
import { getAgencies, getPlans } from "./actions";
import AgencyList from "./agency-list";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboardPage() {
    const [agencies, plans] = await Promise.all([
        getAgencies(),
        getPlans(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>Agencies</h1>
                <p className="text-gray-500 text-sm mt-1">Manage every agency on the platform and their subscription plan.</p>
            </div>

            <AgencyList initialAgencies={agencies as any} plans={plans as any} />
        </div>
    );
}