import React from "react";
import { getStepTemplates } from "./actions";
import StepCustomizer from "./step-customizer";
import GeneralSettingsPanel from "./general-settings-panel";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrdered } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
    const stepRows = await getStepTemplates();

    return (
        <div className="space-y-12 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b-4 border-gray-900">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">System Configuration</span>
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">Settings</h1>
                    <p className="text-gray-500 font-bold tracking-tight mt-1">Manage global system parameters and your application workflow.</p>
                </div>
            </div>

            <GeneralSettingsPanel />

            <Card className="border-none shadow-2xl shadow-gray-100 rounded-[50px] overflow-hidden bg-white">
                <CardHeader className="bg-gray-50/50 flex flex-row items-center gap-4 py-8 px-10 border-b border-gray-100">
                    <div className="bg-gray-900 p-2.5 rounded-2xl">
                        <ListOrdered className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Application Steps</CardTitle>
                        <p className="text-sm font-bold text-gray-400 mt-1">
                            Choose which steps new applications go through, their order, and how they're labeled for agents and clients.
                        </p>
                    </div>
                </CardHeader>
                <div className="p-10">
                    {"error" in stepRows ? (
                        <p className="text-center text-gray-500">{stepRows.error}</p>
                    ) : (
                        <StepCustomizer initialRows={stepRows} />
                    )}
                </div>
            </Card>
        </div>
    );
}