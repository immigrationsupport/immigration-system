import React from "react";
import { getAllPlans } from "./actions";
import PlanManager from "./plan-manager";

export const dynamic = "force-dynamic";

export default async function SuperAdminSettingsPage() {
    const plans = await getAllPlans();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage the plans agencies can subscribe to.</p>
            </div>

            <PlanManager initialPlans={plans as any} />
        </div>
    );
}