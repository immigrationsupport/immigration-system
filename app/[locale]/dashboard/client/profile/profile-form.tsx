"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, CheckCircle2, Globe, Calendar, Users, Briefcase, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import ChangePasswordButton from "@/components/ChangePasswordButton";

interface ProfileFormProps {
    user: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string | null;
        nationality: string | null;
        dateOfBirth: Date | null;
        maritalStatus: string | null;
        numberOfChildren: number;
        address: string | null;
        agent?: {
            name: string;
            email: string;
        } | null;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const t = useTranslations("profile");

    return (
        <div className="bg-white rounded-[50px] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Upper Section: Basic Info & Form Toggle */}
            <div className="p-10 md:p-14 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-10 border-b border-gray-50">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#1E3A8A] to-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-100">
                            {user.name[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">{t("identityProfile")}</p>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{user.name}</h2>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full mt-2">
                                <CheckCircle2 size={10} /> {t("verifiedAccount")}
                            </span>
                        </div>
                    </div>
                    <ChangePasswordButton />
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-500 uppercase tracking-widest">
                    This information is managed by your agent. Contact your specialist below if anything needs updating.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={12} className="text-blue-500" /> {t("emailAddress")}
                        </p>
                        <p className="text-md font-bold text-gray-900">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Phone size={12} className="text-blue-500" /> {t("phoneNumber")}
                        </p>
                        <p className="text-md font-bold text-gray-900">{user.phoneNumber || t("notProvided")}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={12} className="text-blue-500" /> {t("nationality")}
                        </p>
                        <p className="text-md font-bold text-gray-900">{user.nationality || t("notSpecified")}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={12} className="text-blue-500" /> {t("dateOfBirth")}
                        </p>
                        <p className="text-md font-bold text-gray-900">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : t("notSpecified")}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Users size={12} className="text-blue-500" /> {t("maritalStatus")}
                        </p>
                        <p className="text-md font-bold text-gray-900">{user.maritalStatus ? t(`maritalOptions.${user.maritalStatus}` as any) : t("notSpecified")}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase size={12} className="text-blue-500" /> {t("children")}
                        </p>
                        <p className="text-md font-bold text-gray-900">{user.numberOfChildren} {t("childrenSuffix")}</p>
                    </div>
                    <div className="md:col-span-2 space-y-1 lg:col-span-3 pt-6 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={12} className="text-blue-500" /> {t("currentAddress")}
                        </p>
                        <p className="text-md font-bold text-gray-900 leading-relaxed">{user.address || t("noAddressProvided")}</p>
                    </div>
                </div>
            </div>

            {/* Lower Section: Assigned Specialist (Integrated Info) */}
            <div className="bg-gray-50/50 p-10 md:p-14 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1E3A8A] text-xl font-black">
                        {user.agent ? user.agent.name[0].toUpperCase() : "?"}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("assignedSupport")}</p>
                        <h4 className="text-xl font-black text-gray-900">{user.agent ? user.agent.name : t("unassignedSpecialist")}</h4>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-tight">{user.agent ? user.agent.email : t("waitingForAssignment")}</p>
                    </div>
                </div>
                {user.agent && (
                    <Button variant="outline" className="border-gray-200 text-[#1E3A8A] font-black rounded-xl px-8 h-12 uppercase tracking-widest text-xs hover:bg-white shadow-sm">
                        {t("contactSpecialist")}
                    </Button>
                )}
            </div>
        </div>
    );
}