"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X, Mail, Phone, User, Loader2, CheckCircle2, AlertCircle, Globe, Calendar, Users, Briefcase, MapPin } from "lucide-react";
import { updateProfileTranslate } from "./actions";

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
            setMessage({ type: "error", text: "Please fill in all fields (Full Name, Email, and Phone Number)." });
            setLoading(false);
            return;
        }

        const res = await updateProfileTranslate(formData);
        setLoading(false);

        if (res.error) {
            setMessage({ type: "error", text: res.error });
        } else {
            setMessage({ type: "success", text: res.success || "Update successful!" });
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
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Identity Profile</p>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{formData.name}</h2>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full mt-2">
                                <CheckCircle2 size={10} /> Verified Account
                            </span>
                        </div>
                    </div>
                    {!isEditing && (
                        <Button 
                            onClick={() => setIsEditing(true)}
                            className="bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest px-8 h-14 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Edit2 size={18} /> Edit Profile
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
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">Email Address</label>
                                <input 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">Phone Number</label>
                                <input 
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>

                            {/* Secondary Info */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">Nationality</label>
                                <input 
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">Date of Birth</label>
                                <input 
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">Marital Status</label>
                                <select 
                                    value={formData.maritalStatus}
                                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                >
                                    <option value="SINGLE">Single</option>
                                    <option value="MARRIED">Married</option>
                                    <option value="DIVORCED">Divorced</option>
                                    <option value="WIDOWED">Widowed</option>
                                </select>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">Dependents (Children)</label>
                                <input 
                                    type="number"
                                    value={formData.numberOfChildren}
                                    onChange={(e) => setFormData({ ...formData, numberOfChildren: parseInt(e.target.value) || 0 })}
                                    className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 font-black text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-[#1E3A8A] transition-all outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest ml-1">Current Address</label>
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
                                Save Profile Data
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
                                <X className="mr-2" /> Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} className="text-blue-500" /> Email Address
                            </p>
                            <p className="text-md font-bold text-gray-900">{formData.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={12} className="text-blue-500" /> Phone Number
                            </p>
                            <p className="text-md font-bold text-gray-900">{formData.phoneNumber || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={12} className="text-blue-500" /> Nationality
                            </p>
                            <p className="text-md font-bold text-gray-900">{user.nationality || "Not specified"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} className="text-blue-500" /> Date of Birth
                            </p>
                            <p className="text-md font-bold text-gray-900">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not specified"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Users size={12} className="text-blue-500" /> Marital Status
                            </p>
                            <p className="text-md font-bold text-gray-900">{user.maritalStatus || "Not specified"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={12} className="text-blue-500" /> Dependents
                            </p>
                            <p className="text-md font-bold text-gray-900">{user.numberOfChildren} children</p>
                        </div>
                        <div className="md:col-span-2 space-y-1 lg:col-span-3 pt-6 border-t border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={12} className="text-blue-500" /> Current Address
                            </p>
                            <p className="text-md font-bold text-gray-900 leading-relaxed">{user.address || "No address provided yet."}</p>
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
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Support</p>
                        <h4 className="text-xl font-black text-gray-900">{user.agent ? user.agent.name : "Unassigned Specialist"}</h4>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-tight">{user.agent ? user.agent.email : "Waiting for assignment..."}</p>
                    </div>
                </div>
                {user.agent && (
                    <Button variant="outline" className="border-gray-200 text-[#1E3A8A] font-black rounded-xl px-8 h-12 uppercase tracking-widest text-xs hover:bg-white shadow-sm">
                        Contact Specialist
                    </Button>
                )}
            </div>
        </div>
    );
}
