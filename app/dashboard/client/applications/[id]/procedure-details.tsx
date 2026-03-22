"use client";

import React, { useState } from "react";
import {
    FileText,
    Lock,
    Unlock,
    Upload,
    Trash,
    MessageSquare,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    Paperclip,
    Plus,
    Download,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitProcedureAction, addDocumentAction, deleteDocumentAction } from "./actions";
import { generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { UploadButton } from "@/src/utils/uploadthing";

const UploadDropzone = generateUploadDropzone<OurFileRouter>();
interface ProcedureDetailsProps {
    procedure: any;
    isPending?: boolean;
}

export default function ProcedureDetails({ procedure, isPending }: ProcedureDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<any | null>(null);
    const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string } | null>(null);

    const handleSubmit = async () => {
        if (!confirm("Are you sure? Once submitted, you cannot edit this procedure until an agent unlocks it.")) return;
        setLoading(true);
        const res = await submitProcedureAction(procedure.id);
        setLoading(false);
        if (res.error) alert(res.error);
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isPending) {
            alert("Your account is awaiting admin validation.");
            return;
        }

        if (!uploadedFile) {
            alert("Please upload a file first.");
            return;
        }

        setUploading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const serverFormData = new FormData();
            serverFormData.append("procedureId", formData.get("procedureId") as string);
            serverFormData.append("name", formData.get("name") as string);
            serverFormData.append("type", formData.get("type") as string);
            serverFormData.append("fileUrl", uploadedFile.url); // ✅ key change

            const res = await addDocumentAction(serverFormData);

            if (res.error) {
                alert(res.error);
            } else {
                form.reset();
                setUploadedFile(null);
            }
        } catch (err) {
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    };


    const handleDeleteDoc = async (docId: string) => {
        if (isPending) {
            alert("Your account is awaiting admin validation.");
            return;
        }

        if (!confirm("Delete this document?")) return;
        setLoading(true);
        const res = await deleteDocumentAction(docId);
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
                        <div className={`p-3 rounded-2xl shadow-sm ${procedure.isLocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                            {procedure.isLocked ? <Lock className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pathway Type</span>
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                                            style={{ width: `${Math.min((procedure.documents.length / 8) * 100, 100)}%` }}
                                        >
                                            <span className="text-[10px] font-black text-white drop-shadow-md">
                                                {Math.round((procedure.documents.length / 8) * 100)}%
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                Documents Uploaded: {procedure.documents.length} / 8 Target
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
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {new Date(doc.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="h-1 w-1 bg-gray-300 rounded-full" />
                                                        <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${doc.status === "VERIFIED" ? "text-green-500" : "text-blue-500"
                                                            }`}>
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
                                                {!procedure.isLocked && !isPending && (
                                                    <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {procedure.documents.length === 0 && (
                                        <div className="text-center py-16 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                                            <Upload className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Digital Vault Empty</h4>
                                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-2">Upload your first document to begin tracking</p>
                                        </div>
                                    )}
                                </div>

                                {!procedure.isLocked && !isPending && (
                                    <form onSubmit={handleUpload} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl space-y-6 relative overflow-hidden group/form">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover/form:scale-150 opacity-20" />

                                        <div className="relative z-10 space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Select Document Type</label>
                                                <select
                                                    name="type"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 h-14 text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all appearance-none cursor-pointer"
                                                    required
                                                    onChange={(e) => {
                                                        const input = e.target.form?.elements.namedItem("name") as HTMLInputElement;
                                                        if (input) input.value = e.target.value.replace("_", " ");
                                                    }}
                                                >
                                                    <option value="">-- CHOOSE FROM DEVICE --</option>
                                                    <optgroup label="Identity Documents">
                                                        <option value="PASSPORT">Passport</option>
                                                        <option value="PASSPORT_PHOTO">Passport Photo</option>
                                                        <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                                                        <option value="ID_CARD">National ID Card</option>
                                                    </optgroup>
                                                    <optgroup label="Education Documents">
                                                        <option value="DIPLOMA">Diploma / Degree</option>
                                                        <option value="TRANSCRIPT">Academic Transcript</option>
                                                    </optgroup>
                                                    <optgroup label="Professional Documents">
                                                        <option value="CV">CV / Resume</option>
                                                        <option value="WORK_CERTIFICATE">Work Certificate</option>
                                                    </optgroup>
                                                    <optgroup label="Language Test Documents">
                                                        <option value="LANGUAGE_REGISTRATION">Language Test Registration</option>
                                                        <option value="LANGUAGE_RESULT">Language Test Result (IELTS/TEF)</option>
                                                    </optgroup>
                                                    <optgroup label="Immigration Documents">
                                                        <option value="MEDICAL">Medical Examination</option>
                                                        <option value="POLICE_CLEARANCE">Police Clearance</option>
                                                        <option value="VISA_APPROVAL">Visa Approval</option>
                                                    </optgroup>
                                                    <option value="OTHER">Other Document</option>
                                                </select>
                                                <input type="hidden" name="name" />
                                            </div>

                                            <div className="relative group/zone">
                                                <div className="absolute inset-0 z-20 w-full h-full opacity-0">
                                                    <UploadButton
                                                        endpoint="documentUploader"
                                                        appearance={{
                                                            button: "w-full h-full cursor-pointer",
                                                            container: "w-full h-full",
                                                            allowedContent: "hidden",
                                                        }}
                                                        onUploadBegin={() => setUploading(true)}
                                                        onClientUploadComplete={(res) => {
                                                            const file = res[0];
                                                            setUploadedFile(file);
                                                            setUploading(false);
                                                        }}
                                                        onUploadError={(error: Error) => {
                                                            setUploading(false);
                                                            alert(`ERROR! ${error.message}`);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-blue-100 rounded-3xl bg-blue-50/20 group-hover/zone:bg-blue-50/50 group-hover/zone:border-blue-400 transition-all duration-500">
                                                    <div className="bg-white p-4 rounded-2xl shadow-lg shadow-blue-100 transition-transform duration-500 group-hover/zone:rotate-12">
                                                        {uploadedFile ? (
                                                            <FileText className="h-7 w-7 text-green-600" />
                                                        ) : (
                                                            <Upload className="h-7 w-7 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        {uploadedFile ? (
                                                            <>
                                                                <p className="text-xs font-black text-green-700 uppercase tracking-tight line-clamp-1 max-w-[200px]">{uploadedFile.name}</p>
                                                                <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest mt-1">File Ready for Submission</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Select file from device</p>
                                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">PDF, JPG, PNG (MAX. 5MB)</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <input type="hidden" name="procedureId" value={procedure.id} />
                                            <Button
                                                disabled={uploading}
                                                className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-2xl h-16 font-black text-sm tracking-[0.1em] shadow-2xl shadow-blue-200 transition-all hover:translate-y-[-4px] active:scale-95 group/btn overflow-hidden relative"
                                            >
                                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                                                {uploading ? (
                                                    <Loader2 className="animate-spin h-6 w-6" />
                                                ) : (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Plus className="h-5 w-5" />
                                                        <span>CONFIRM & SUBMIT DOCUMENT</span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Messages Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-blue-500" /> Communication Channel
                                </h3>
                                <div className="bg-white border border-gray-100 rounded-3xl p-6 min-h-[300px] flex flex-col shadow-sm max-h-[400px] overflow-y-auto">
                                    <div className="space-y-6 flex-1">
                                        {procedure.messages.map((msg: any) => (
                                            <div key={msg.id} className={`flex flex-col ${msg.senderId === procedure.application.clientId ? "items-end" : "items-start"}`}>
                                                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm tracking-tight text-sm ${msg.senderId === procedure.application.clientId ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none font-medium"}`}>
                                                    {msg.content}
                                                </div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 px-1">{new Date(msg.createdAt).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {procedure.messages.length === 0 && (
                                            <div className="flex items-center justify-center flex-col py-12 opacity-30 grayscale">
                                                <MessageSquare className="h-12 w-12 mb-2" />
                                                <p className="text-sm font-black uppercase tracking-widest">No Communication Found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Procedure Submission Button */}
                                {!procedure.isLocked && !isPending ? (
                                    <div className="p-8 bg-gradient-to-br from-blue-900 to-[#1e3a8a] rounded-3xl shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <AlertCircle className="h-12 w-12 transition-transform duration-700 group-hover:scale-125" />
                                        </div>
                                        <div className="relative z-10 text-center">
                                            <h4 className="text-white font-black text-lg mb-2">Ready to Submit?</h4>
                                            <p className="text-blue-200 text-xs mb-6 px-4">Submitting will lock the procedure for review. Ensure all required documents are attached.</p>
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={loading || procedure.documents.length === 0}
                                                className="w-full bg-[#1E3A8A] text-white hover:bg-blue-50 font-black h-14 rounded-2xl shadow-xl transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "YES, SUBMIT PROCEDURE"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : isPending ? (
                                    <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl flex flex-col items-center text-center">
                                        <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 mb-4 shadow-sm">
                                            <AlertCircle className="h-7 w-7" />
                                        </div>
                                        <h4 className="text-amber-900 font-black text-lg mb-1 uppercase tracking-tight">Account Awaiting Validation</h4>
                                        <p className="text-amber-700/70 text-xs font-semibold max-w-xs">You cannot add documents or submit procedures until your account has been validated by an administrator.</p>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex flex-col items-center text-center">
                                        <div className="bg-red-100 p-3 rounded-2xl text-red-600 mb-4 shadow-sm">
                                            <Lock className="h-7 w-7" />
                                        </div>
                                        <h4 className="text-red-900 font-black text-lg mb-1 uppercase tracking-tight">Procedure Locked</h4>
                                        <p className="text-red-700/70 text-xs font-semibold max-w-xs">Currently being handled by our legal team. Modification is disabled to preserve record integrity.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

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
                        {/* Viewer */}
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
