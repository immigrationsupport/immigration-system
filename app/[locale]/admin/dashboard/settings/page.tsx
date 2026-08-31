import React from "react";
import GeneralSettingsPanel from "./general-settings-panel";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
    const t = await getTranslations("adminSettings");
    return (
        <div className="space-y-12 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b-4 border-gray-900">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">{t("eyebrow")}</span>
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">{t("title")}</h1>
                    <p className="text-gray-500 font-bold tracking-tight mt-1">{t("subtitle")}</p>
                </div>
            </div>

            <GeneralSettingsPanel />
        </div>
    );
}