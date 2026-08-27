"use client";

import React, { useState } from "react";
import {
    FileText,
    Lock,
    Unlock,
    Upload,
    Trash,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    Paperclip,
    Download,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitProcedureAction } from "./actions";

interface ProcedureDetailsProps {
    procedure: any;
}

export default function ProcedureDetails({ procedure }: ProcedureDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [loading, setLoading] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string } | null>(null);

    const handleSubmit = async () => {
        if (!confirm("Are you sure? Once submitted, you cannot edit this procedure until an agent unlocks it.")) return;
        setLoading(true);
        const res = await submitProcedureAction(procedure.id);
        setLoading(false);
        if (res.error) alert(res.error);
    };

    return (
        <>
            <Card className={`overflow-hidden transition-all duration-500 rounded-3xl border-none shadow-xl ${procedure.isLocked ? "bg-gray-50/50" : "bg-white"}`}>
                <CardHeader
                    className={`flex flex-row items-center justify-between p-8 border-b border-gray-100 cursor-pointer ${procedure.isLocked ? "bg-gray-100/50" : "bg-blue-50/20"}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex gap-6 items-center">
                        <div className={`p-3 rounded-2xl shadow-sm ${procedure.isLocked ? "bg-red-100 text-red-600" : "bg-gray-100 text-green-600"}`}>
                            {procedure.isLocked ? <Lock className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">country</span>
                                <span className="h-1 w-1 bg-gray-300 rounded-full" />
                                <span className="text-xs font-black text-blue-700 uppercase tracking-widest">{procedure.type}</span>
                            </div>
                            <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">{procedure.description || "Project Details"}</CardTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Status</span>
                            <div className="flex items-center gap-2">
                                {procedure.status === "PENDING" ? <Clock className="h-4 w-4 text-yellow-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                <span className="font-bold text-gray-700 uppercase text-xs">{procedure.status.replace("_", " ")}</span>
                            </div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-6 w-6 text-gray-400" /> : <ChevronDown className="h-6 w-6 text-gray-400" />}
                    </div>
                </CardHeader>

                {isExpanded && (
                    <CardContent className="p-8 space-y-10 animate-in slide-in-from-top-4 duration-500">
                        {/* Centered Layout Wrapper */}
                        <div className="max-w-3xl mx-auto space-y-10">
                            
                            {/* Documents Section */}
                            <div className="space-y-6">
                                <div className="flex flex-col gap-4 px-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Paperclip className="h-4 w-4 text-blue-500" /> Case Documents
                                        </h3>
                                        <div className="bg-blue-50 text-[#1E3A8A] px-3 py-1 rounded-full text-[10px] font-bold ring-1 ring-blue-100">
                                            {procedure.documents.length} Files Attached
                                        </div>
                                    </div>

                                    {/* Progress Indicator */}
                                    <div className="bg-gray-100 h-6 w-full rounded-full overflow-hidden relative shadow-inner border border-gray-200">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-[#1E3A8A] transition-all duration-1000 ease-out flex items-center justify-end px-3 shadow-lg"
                                            style={{ width: `${Math.min((procedure.documents.length / 11) * 100, 100)}%` }}
                                        >
                                            <span className="text-[10px] font-black text-white drop-shadow-md">
                                                {Math.round((procedure.documents.length / 11) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {procedure.documents.map((doc: any) => (
                                        <div key={doc.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl group hover:shadow-2xl hover:border-blue-200 transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-[#1E3A8A] group-hover:text-white transition-all duration-500">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors uppercase">{doc.name.replace("_", " ")}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${doc.status === "VERIFIED" ? "text-green-500" : "text-blue-500"}`}>
                                                            <CheckCircle2 className="h-3 w-3" /> {doc.status || "UPLOADED"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setViewingDoc({ url: doc.fileUrl, name: doc.name })}
                                                    className="bg-gray-50 hover:bg-blue-50 text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-2 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                                >
                                                    VIEW
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {procedure.documents.length === 0 && (
                                        <div className="text-center py-16 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                                            <Upload className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Digital Vault Empty</h4>
                                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-2">Your agent will upload documents here as your case progresses</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Section */}
                            <div className="space-y-8">
                                {!procedure.isLocked && (
                                    <>
                                        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-start gap-4">
                                            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-blue-100 shrink-0">
                                                <Paperclip className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <p className="text-xs font-semibold text-blue-800/80 leading-relaxed">
                                                Documents for this step are uploaded by your agent or the agency's admin team — you don't need to upload anything yourself. You can review and download each file above as it's added.
                                            </p>
                                        </div>

                                        {/* Final Submission Card */}
                                        <div className="p-8 bg-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-100">
                                                <AlertCircle className="h-12 w-12 transition-transform duration-700 group-hover:scale-125 text-amber-500" />
                                            </div>
                                            <div className="relative z-10 text-center">
                                                <h4 className="text-white-500 text-2xl font-bold ">Ready to Submit?</h4>
                                                <p className="text-red-500 text-xl mb-6 px-4">Submitting will lock the procedure for review. Ensure all documents are attached.</p>
                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={loading || procedure.documents.length === 0}
                                                    className="w-full bg-[#1E3A8A] text-white bg-blue-900 font-black h-14 rounded-2xl shadow-xl transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
                                                >
                                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "YES, SUBMIT PROCEDURE"}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {procedure.isLocked && (
                                    <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex flex-col items-center text-center">
                                        <div className="bg-red-100 p-3 rounded-2xl text-red-600 mb-4 shadow-sm">
                                            <Lock className="h-7 w-7" />
                                        </div>
                                        <h4 className="text-red-900 font-black text-lg mb-1 uppercase tracking-tight">Procedure Locked</h4>
                                        <p className="text-red-700/70 text-xs font-semibold max-w-xs">Currently being handled by our legal team. Modification is disabled.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Document Viewer Overlay */}
            {viewingDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#1a1a1a] w-full max-w-6xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                    <FileText size={18} />
                                </div>
                                <h3 className="text-white font-bold truncate max-w-md">{viewingDoc?.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={viewingDoc?.url}
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
                        <div className="flex-1 bg-[#121212] overflow-hidden relative flex items-center justify-center p-4">
                            {/\.(jpe?g|png|gif|webp)$/i.test(viewingDoc?.url || "") ? (
                                <img
                                    src={viewingDoc?.url}
                                    alt={viewingDoc?.name}
                                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                                />
                            ) : (
                                <iframe
                                    src={`${viewingDoc?.url}#toolbar=1&navpanes=0&view=FitH`}
                                    className="w-full h-full border-none"
                                    title="Document Viewer"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}