"use client";

import React, { useEffect, useState } from "react";
import {
    X,
    FileText,
    User,
    Globe,
    Calendar,
    Shield,
    Download,
    Briefcase,
    ExternalLink,
    MapPin,
    Hash,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    UserCircle2,
    Mail,
    Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApplicationDetails } from "@/app/admin/dashboard/applications/details-actions";

interface DetailsModalProps {
    applicationId: string;
    onClose: () => void;
}

export default function ApplicationDetailsModal({ applicationId, onClose }: DetailsModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            setLoading(true);
            const res = await getApplicationDetails(applicationId);
            if (res.success) setData(res.application);
            setLoading(false);
        }
        fetch();
    }, [applicationId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "APPROVED": return <CheckCircle2 size={24} className="text-green-500" />;
            case "REJECTED": return <XCircle size={24} className="text-red-500" />;
            case "PENDING": return <Clock size={24} className="text-amber-500" />;
            default: return <AlertCircle size={24} className="text-blue-500" />;
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl animate-pulse">
                <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Retrieving Deep Details...</p>
            </div>
        </div>
    );

    if (!data) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl relative animate-in zoom-in-95 duration-200 my-auto">
                {/* Header */}
                <div className="p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Application: {data.id.substring(0, 8).toUpperCase()}</h2>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Globe size={14} /> {data.destination} <span className="text-gray-300">|</span> {data.type.replace('_', ' ')}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
                        <X size={20} className="text-gray-500" />
                    </Button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: People */}
                        <div className="space-y-6 lg:col-span-1">
                            {/* Client Section */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <User size={14} /> Client Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                            {data.client.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{data.client.name}</p>
                                            <p className="text-xs text-blue-600 font-medium">{data.client.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2 border-t border-gray-200/50">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Nationality</span>
                                            <span className="font-bold text-gray-800">{data.client.nationality || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Phone</span>
                                            <span className="font-bold text-gray-800">{data.client.phoneNumber || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Status</span>
                                            <span className="font-bold text-gray-800 capitalize">{data.client.maritalStatus?.toLowerCase() || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Agent Section */}
                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Shield size={14} /> Assigned Agent
                                </h3>
                                {data.agent ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{data.agent.name}</p>
                                            <p className="text-xs text-gray-500">{data.agent.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-gray-400 py-2">No agent assigned yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Timeline & Procedures */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Hash size={18} className="text-blue-600" />
                                        Application Timeline & Procedures
                                    </h3>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${data.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                        {data.status}
                                    </span>
                                </div>

                                <div className="p-6">
                                    {data.procedures.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400 italic">No procedures initialized.</div>
                                    ) : (
                                        <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                            {data.procedures.map((proc: any) => (
                                                <div key={proc.id} className="relative pl-10">
                                                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white border-4 border-blue-100 flex items-center justify-center z-10">
                                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                                    </div>

                                                    <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-gray-900 text-sm">Procedure: {proc.type.replace('_', ' ')}</h4>
                                                            <span className="text-[10px] text-gray-400 font-medium">{new Date(proc.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm leading-relaxed italic">
                                                            "{proc.description || "No description provided."}"
                                                        </p>

                                                        {/* Related Documents */}
                                                        {proc.documents.length > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Submitted Evidence</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {proc.documents.map((doc: any) => (
                                                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 group">
                                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                                                                    <Download size={16} />
                                                                                </div>
                                                                                <div className="overflow-hidden">
                                                                                    <p className="text-xs font-bold text-gray-700 truncate">{doc.name}</p>
                                                                                    <p className="text-[9px] text-gray-400 uppercase">{doc.type}</p>
                                                                                </div>
                                                                            </div>
                                                                            <a
                                                                                href={doc.fileUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-700 transition-colors rounded-lg"
                                                                            >
                                                                                <ExternalLink size={14} />
                                                                            </a>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="rounded-xl font-bold px-8 h-11 border-gray-200">
                        Close Overview
                    </Button>
                </div>
            </div>
        </div>
    );
}
