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
    Phone,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApplicationDetails, unlockApplication, validateApplication } from "./details-actions";
import { toast } from "sonner";

interface DetailsModalProps {
    applicationId: string;
    onClose: () => void;
}

export default function ApplicationDetailsModal({ applicationId, onClose }: DetailsModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string } | null>(null);
    const [actionLoading, setActionLoading] = useState<"unlock" | "validate" | null>(null);

    const fetchDetails = async () => {
        setLoading(true);
        const res = await getApplicationDetails(applicationId);
        if (res.success) setData(res.application);
        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [applicationId]);

    const handleUnlock = async () => {
        setActionLoading("unlock");
        const res = await unlockApplication(applicationId);
        if (res.success) {
            toast.success("Application unlocked successfully.");
            fetchDetails();
        } else {
            toast.error(res.error || "Failed to unlock.");
        }
        setActionLoading(null);
    };

    const handleValidate = async () => {
        setActionLoading("validate");
        const res = await validateApplication(applicationId);
        if (res.success) {
            toast.success("Application validated successfully.");
            fetchDetails();
        } else {
            toast.error(res.error || "Failed to validate.");
        }
        setActionLoading(null);
    };

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
                    {/* Lock Status Banner */}
                    {(data.status === "SUBMITTED" || data.status === "VALIDATED") && (
                        <div className="bg-red-50/80 border border-red-200 p-5 rounded-2xl flex items-center gap-4 text-red-700 shadow-sm animate-in slide-in-from-top-4 duration-500">
                            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-red-100">
                                <Lock className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-[15px] uppercase tracking-wide">Application Locked by Submission</h4>
                                <p className="text-sm font-medium opacity-90 mt-0.5">The client has submitted this application. Their profile and procedures are now read-only to them. Unlock the application to grant edit access back to the client.</p>
                            </div>
                        </div>
                    )}

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
                                    {data.steps.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400 italic">No procedures initialized.</div>
                                    ) : (
                                        <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                            {data.steps.map((proc: any) => (
                                                <div key={proc.id} className="relative pl-10">
                                                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white border-4 border-blue-100 flex items-center justify-center z-10">
                                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                                    </div>

                                                    <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-gray-900 text-sm">Procedure: {proc.type.replace('_', ' ')}</h4>
                                                            <span className="text-[10px] text-gray-400 font-medium">{new Date(proc.updatedAt).toLocaleDateString("en-US")}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm leading-relaxed italic">
                                                            "{proc.description || "No description provided."}"
                                                        </p>

                                                        {/* Related Documents */}
                                                        {proc.Document.length > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Submitted Evidence</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {proc.Document.map((doc: any) => (
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
                                                                            <button
                                                                                onClick={() => setViewingDoc({ url: doc.fileUrl, name: doc.name })}
                                                                                className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-700 transition-colors rounded-lg"
                                                                                title="View in Browser"
                                                                            >
                                                                                <ExternalLink size={14} />
                                                                            </button>
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

                {/* Integrated Document Viewer Overlay */}
                {viewingDoc && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#1a1a1a] w-full max-w-6xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                        <FileText size={18} />
                                    </div>
                                    <h3 className="text-white font-bold truncate max-w-md">{viewingDoc.name}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a 
                                        href={viewingDoc.url} 
                                        download 
                                        className="h-10 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all"
                                    >
                                        <Download size={16} /> Download
                                    </a>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setViewingDoc(null)} 
                                        className="h-10 w-10 text-white hover:bg-white/10 rounded-xl"
                                    >
                                        <X size={20} />
                                    </Button>
                                </div>
                            </div>
                            {/* Viewer */}
                            <div className="flex-1 bg-[#121212] overflow-hidden relative flex items-center justify-center p-4">
                                {/\.(jpe?g|png|gif|webp)$/i.test(viewingDoc.url) ? (
                                    <img
                                        src={viewingDoc.url}
                                        alt={viewingDoc.name}
                                        className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                                    />
                                ) : (
                                    <iframe 
                                        src={`${viewingDoc.url}#toolbar=1&navpanes=0&view=FitH`}
                                        className="w-full h-full border-none"
                                        title="Document Viewer"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-between gap-3">
                    <div className="flex gap-2">
                        {(data.status === "SUBMITTED" || data.status === "VALIDATED") && (
                            <Button 
                                variant="outline" 
                                onClick={handleUnlock} 
                                disabled={actionLoading !== null}
                                className="rounded-xl font-bold px-8 h-11 border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                                {actionLoading === "unlock" ? "Unlocking..." : "Unlock Application"}
                            </Button>
                        )}
                        {data.status !== "VALIDATED" && (
                            <Button 
                                variant="primary" 
                                onClick={handleValidate} 
                                disabled={actionLoading !== null}
                                className="rounded-xl font-bold px-8 h-11 bg-green-600 hover:bg-green-700 text-white"
                            >
                                {actionLoading === "validate" ? "Validating..." : "Validate Application"}
                            </Button>
                        )}
                    </div>
                    <Button variant="outline" onClick={onClose} className="rounded-xl font-bold px-8 h-11 border-gray-200">
                        Close Overview
                    </Button>
                </div>
            </div>
        </div>
    );
}