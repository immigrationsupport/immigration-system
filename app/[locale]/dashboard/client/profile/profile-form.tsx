"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X, Mail, Phone, User, Loader2, CheckCircle2, AlertCircle, Globe, Calendar, Users, Briefcase, MapPin } from "lucide-react";
import { updateProfileTranslate } from "./actions";
import { useTranslations } from "next-intl";

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
    const tCommon = useTranslations("common");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        nationality: user.nationality || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        maritalStatus: user.maritalStatus || "SINGLE",
        numberOfChildren: user.numberOfChildren || 0,
        address: user.address || ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!formData.name.trim() || !formData.email.trim() || !formData.phoneNumber.trim()) {
            setMessage({ type: "error", text: t("fillAllFieldsError") });
            setLoading(false);
            return;
        }

        const res = await updateProfileTranslate(formData);
        setLoading(false);

        if (res.error) {
            setMessage({ type: "error", text: res.error });
        } else {
            setMessage({ type: "success", text: res.success || t("updateSuccessful") });
            setIsEditing(false);
        }
    };

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
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{formData.name}</h2>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full mt-2">
                                <CheckCircle2 size={10} /> {t("verifiedAccount")}
                            </span>
                        </div>
                    </div>
                    {!isEditing && (
                        <Button 
                            onClick={() => setIsEditing(true)}
                            className="bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest px-8 h-14 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Edit2 size={18} /> {t("editProfile")}
                        </Button>
                    )}
                </div>

                {message && (
                    <div className={`p-5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${
                        message.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-red-50 text-red-800 border-red-100"
                    }`}>
                        {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-black uppercase tracking-tight">{message.text}</span>
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleSave} className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {/* Primary Info */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">{t("fullName")}</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">{t("emailAddress")}</label>
                                <input 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">{t("phoneNumber")}</label>
                                <input 
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>

                            {/* Secondary Info */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">{t("nationality")}</label>
                                <input 
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">{t("dateOfBirth")}</label>
                                <input 
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">{t("maritalStatus")}</label>
                                <select 
                                    value={formData.maritalStatus}
                                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                >
                                    <option value="SINGLE">{t("maritalOptions.SINGLE")}</option>
                                    <option value="MARRIED">{t("maritalOptions.MARRIED")}</option>
                                    <option value="DIVORCED">{t("maritalOptions.DIVORCED")}</option>
                                    <option value="WIDOWED">{t("maritalOptions.WIDOWED")}</option>
                                </select>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">{t("dependentsChildren")}</label>
                                <input 
                                    type="number"
                                    value={formData.numberOfChildren}
                                    onChange={(e) => setFormData({ ...formData, numberOfChildren: parseInt(e.target.value) || 0 })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">{t("currentAddress")}</label>
                                <input 
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <Button 
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white font-black h-16 rounded-2xl uppercase tracking-[0.1em] shadow-2xl shadow-blue-100 transition-all active:scale-95"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={20} />}
                                {t("saveProfileData")}
                            </Button>
                            <Button 
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({ 
                                        name: user.name, 
                                        email: user.email, 
                                        phoneNumber: user.phoneNumber || "",
                                        nationality: user.nationality || "",
                                        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
                                        maritalStatus: user.maritalStatus || "SINGLE",
                                        numberOfChildren: user.numberOfChildren || 0,
                                        address: user.address || ""
                                    });
                                    setMessage(null);
                                }}
                                variant="ghost"
                                className="px-10 h-16 text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-50 rounded-2xl"
                            >
                                <X className="mr-2" /> {tCommon("cancel")}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} className="text-blue-500" /> {t("emailAddress")}
                            </p>
                            <p className="text-md font-bold text-gray-900">{formData.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={12} className="text-blue-500" /> {t("phoneNumber")}
                            </p>
                            <p className="text-md font-bold text-gray-900">{formData.phoneNumber || t("notProvided")}</p>
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
                )}
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