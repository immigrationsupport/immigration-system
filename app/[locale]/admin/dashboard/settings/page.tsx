import React from "react";
import GeneralSettingsPanel from "./general-settings-panel";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
    return (
        <div className="space-y-12 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b-4 border-gray-900">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">System Configuration</span>
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">Settings</h1>
                    <p className="text-gray-500 font-bold tracking-tight mt-1">Manage global system parameters.</p>
                </div>
            </div>

            <GeneralSettingsPanel />
        </div>
    );
}