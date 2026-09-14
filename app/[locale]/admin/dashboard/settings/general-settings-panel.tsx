"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, Save, CheckCircle2, AlertCircle, Shield, Info, Database, User, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { updateAgencySettingsAction } from "./actions";

interface GeneralSettingsPanelProps {
    agency: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
    } | null;
    adminUser: {
        id: string;
        name?: string | null;
        email?: string | null;
    } | null;
}

export default function GeneralSettingsPanel({ agency, adminUser }: GeneralSettingsPanelProps) {
    const t = useTranslations("adminSettings");
    const locale = useLocale();

    const [agencyName, setAgencyName] = useState(agency?.name || "");
    const [agencyEmail, setAgencyEmail] = useState(agency?.email || "");
    const [agencyPhone, setAgencyPhone] = useState(agency?.phone || "");
    const [agencyAddress, setAgencyAddress] = useState(agency?.address || "");
    const [adminName, setAdminName] = useState(adminUser?.name || "");

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [auditLogging, setAuditLogging] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append("agencyName", agencyName);
        formData.append("agencyEmail", agencyEmail);
        formData.append("agencyPhone", agencyPhone);
        formData.append("agencyAddress", agencyAddress);
        formData.append("adminName", adminName);

        try {
            const result = await updateAgencySettingsAction(formData);
            if (result.error) {
                setErrorMessage(result.error);
            } else {
                setSaved(true);
                setTimeout(() => setSaved(false), 4000);
            }
        } catch (err: any) {
            setErrorMessage(t("errorDefault"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Agency Profile Card */}
            <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-100 rounded-[50px] overflow-hidden bg-white">
                <CardHeader className="bg-gray-50/50 flex flex-row items-center justify-between gap-4 py-8 px-10 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1E3A8A] p-3 rounded-2xl text-white">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                                {t("agencyProfileTitle")}
                            </CardTitle>
                            <p className="text-xs font-bold text-gray-400">{t("agencyProfileDesc")}</p>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-[#1E3A8A] hover:bg-blue-900 text-white font-black rounded-2xl px-6 py-4 h-auto uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : saved ? (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                            <Save size={16} />
                        )}
                        {saving ? t("saving") : saved ? t("saved") : t("save")}
                    </Button>
                </CardHeader>

                <CardContent className="p-10 space-y-8">
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            {errorMessage}
                        </div>
                    )}

                    {saved && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                            {t("successToast")}
                        </div>
                    )}

                    {/* Agency Name */}
                    <div className="space-y-2">
                        <Label htmlFor="agencyName" className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#1E3A8A]" /> {t("agencyNameLabel")}
                        </Label>
                        <Input
                            id="agencyName"
                            type="text"
                            value={agencyName}
                            onChange={(e) => setAgencyName(e.target.value)}
                            required
                            placeholder={t("agencyNamePlaceholder")}
                            className="h-12 rounded-2xl border-gray-200 bg-gray-50/50 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]"
                        />
                    </div>

                    {/* Grid for Email and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="agencyEmail" className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-[#1E3A8A]" /> {t("agencyEmailLabel")}
                            </Label>
                            <Input
                                id="agencyEmail"
                                type="email"
                                value={agencyEmail}
                                onChange={(e) => setAgencyEmail(e.target.value)}
                                placeholder={t("agencyEmailPlaceholder")}
                                className="h-12 rounded-2xl border-gray-200 bg-gray-50/50 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agencyPhone" className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#1E3A8A]" /> {t("agencyPhoneLabel")}
                            </Label>
                            <Input
                                id="agencyPhone"
                                type="tel"
                                value={agencyPhone}
                                onChange={(e) => setAgencyPhone(e.target.value)}
                                placeholder={t("agencyPhonePlaceholder")}
                                className="h-12 rounded-2xl border-gray-200 bg-gray-50/50 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]"
                            />
                        </div>
                    </div>

                    {/* Agency Address */}
                    <div className="space-y-2">
                        <Label htmlFor="agencyAddress" className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#1E3A8A]" /> {t("agencyAddressLabel")}
                        </Label>
                        <Textarea
                            id="agencyAddress"
                            rows={3}
                            value={agencyAddress}
                            onChange={(e) => setAgencyAddress(e.target.value)}
                            placeholder={t("agencyAddressPlaceholder")}
                            className="rounded-2xl border-gray-200 bg-gray-50/50 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]"
                        />
                    </div>

                    {/* Administrator Profile Name */}
                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-[#1E3A8A]">{t("adminSectionTitle")}</h4>
                        <div className="space-y-2">
                            <Label htmlFor="adminName" className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                <User className="h-4 w-4 text-[#1E3A8A]" /> {t("adminNameLabel")}
                            </Label>
                            <Input
                                id="adminName"
                                type="text"
                                value={adminName}
                                onChange={(e) => setAdminName(e.target.value)}
                                placeholder={t("adminNamePlaceholder")}
                                className="h-12 rounded-2xl border-gray-200 bg-gray-50/50 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]"
                            />
                        </div>
                    </div>

                    {/* System Controls */}
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between group">
                        <div className="space-y-1">
                            <h4 className="text-lg font-black text-gray-900 flex items-center gap-3">
                                <Database size={18} className="text-indigo-500" /> {t("auditLoggingTitle")}
                            </h4>
                            <p className="text-xs font-bold text-gray-400 max-w-md">{t("auditLoggingDesc")}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAuditLogging(!auditLogging)}
                            className={`w-14 h-7 rounded-full transition-all relative ${auditLogging ? 'bg-emerald-500 shadow-md shadow-emerald-100' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all ${auditLogging ? 'left-7.5' : 'left-0.5'}`} />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Sidebar Security & Build Status */}
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
        </form>
    );
}