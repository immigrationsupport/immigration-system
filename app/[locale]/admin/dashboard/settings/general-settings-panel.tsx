"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Shield, Save, Settings, Info, CheckCircle2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export default function GeneralSettingsPanel() {
    const t = useTranslations("adminSettings");
    const locale = useLocale();
    const [auditLogging, setAuditLogging] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-100 rounded-[50px] overflow-hidden bg-white">
                <CardHeader className="bg-gray-50/50 flex flex-row items-center justify-between gap-4 py-8 px-10 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-900 p-2.5 rounded-2xl">
                            <Settings className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{t("globalControls")}</CardTitle>
                    </div>
                    <Button
                        onClick={handleSave}
                        className="bg-gray-900 hover:bg-black text-white font-black rounded-2xl px-6 py-4 h-auto uppercase tracking-widest text-xs transition-all flex items-center gap-2"
                    >
                        {saved ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Save size={16} />}
                        {saved ? t("saved") : t("save")}
                    </Button>
                </CardHeader>
                <CardContent className="p-10">
                    <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                <Database size={20} className="text-indigo-500" /> {t("auditLoggingTitle")}
                            </h4>
                            <p className="text-sm font-bold text-gray-400 max-w-md">{t("auditLoggingDesc")}</p>
                        </div>
                        <button
                            onClick={() => setAuditLogging(!auditLogging)}
                            className={`w-16 h-8 rounded-full transition-all relative ${auditLogging ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${auditLogging ? 'left-9' : 'left-1'}`} />
                        </button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-10">
                <Card className="border-none shadow-2xl shadow-gray-100 rounded-[50px] bg-white p-10 space-y-6">
                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                        <Shield className="h-10 w-10 text-amber-600 mb-4" />
                        <h4 className="text-xl font-black text-amber-900 uppercase tracking-tighter">{t("securityNoteTitle")}</h4>
                        <p className="text-xs font-bold text-amber-800/80 leading-relaxed mt-2 uppercase tracking-wide">
                            {t("securityNoteDesc")}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                        <Info size={20} className="text-gray-400 group-hover:text-gray-900" />
                        <span className="text-xs font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-widest underline decoration-gray-200">{t("systemDocumentation")}</span>
                    </div>
                </Card>

                <Card className="border-none shadow-2xl shadow-blue-50 rounded-[50px] bg-[#1E3A8A] p-10 text-white">
                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">{t("buildLabel")}</h4>
                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{t("productionStable")}</p>
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="opacity-60">{t("lastUpdate")}</span>
                            <span>{new Date().toLocaleDateString(locale)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                            <span className="opacity-60">{t("status")}</span>
                            <span className="text-emerald-400">{t("statusOptimal")}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}