"use client";

import React, { useState } from "react";
import {
    Search,
    Filter,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Loader2,
    FileText,
    Download,
    ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateDocumentStatusAction } from "@/app/admin/dashboard/documents/actions";
import { TruncatedText } from "@/components/ui/truncated-text";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface DocumentItem {
    id: string;
    name: string;
    fileUrl: string;
    type: string;
    status: string;
    uploadedAt: Date;
    uploader: {
        id: string;
        name: string;
        role: string;
    };
    client: {
        id: string;
        name: string;
        email: string;
    };
    application: {
        id: string;
        destination: string;
    };
    procedure: {
        id: string;
        type: string;
    };
}

export default function DocumentTable({
    initialDocuments
}: {
    initialDocuments: DocumentItem[]
}) {
    const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

    const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
    const isPDF = (url: string) => /\.pdf$/i.test(url);

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch =
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.application.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || doc.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = async (docId: string, newStatus: string) => {
        setLoadingId(docId);
        const res = await updateDocumentStatusAction(docId, newStatus);
        setLoadingId(null);

        if (res.success) {
            setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: newStatus } : d));
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "VERIFIED": return { bg: "bg-gray-50", text: "text-green-700", border: "border-gray-200", icon: <CheckCircle2 size={14} /> };
            case "REJECTED": return { bg: "bg-gray-50", text: "text-red-700", border: "border-gray-200", icon: <XCircle size={14} /> };
            case "UPLOADED": return { bg: "bg-gray-50", text: "text-amber-700", border: "border-gray-200", icon: <Clock size={14} /> };
            default: return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: <AlertCircle size={14} /> };
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Filters */}
            <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search doc name, client, or App ID..."
                        className="pl-9 bg-white border-gray-200 focus:ring-blue-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm border-gray-200 rounded-md bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="UPLOADED">Uploaded (Awaiting Review)</option>
                        <option value="VERIFIED">Verified (Approved)</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-50/80">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 first:rounded-tl-xl whitespace-nowrap">Document Details</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Client & Uploader</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Context Reference</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Review Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 whitespace-nowrap">Uploaded At</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100 text-right last:rounded-tr-xl">Preview</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredDocuments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 font-bold border border-gray-100">
                                            <FileText size={16} />
                                        </div>
                                        <div className="max-w-[150px] md:max-w-xs">
                                            <p className="text-sm font-bold text-gray-900 truncate leading-none mb-1">
                                                <TruncatedText text={doc.name} maxLength={25} />
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-900">
                                        <TruncatedText text={doc.client.name} maxLength={15} />
                                    </p>
                    
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-700 bg-blue-50/50 w-fit px-2  uppercase tracking-tighter">
                                            Proc: {(doc.procedure.type || "GENERAL").replace('_', ' ')}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={doc.status}
                                            onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                                            className={`
                                                ${getStatusStyles(doc.status).bg} 
                                                ${getStatusStyles(doc.status).text} 
                                                ${getStatusStyles(doc.status).border} 
                                                text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full border outline-none cursor-pointer transition-all hover:brightness-95
                                            `}
                                            disabled={loadingId === doc.id}
                                        >
                                            <option value="UPLOADED">Under Review</option>
                                            <option value="VERIFIED">Approved (Verified)</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                        {loadingId === doc.id && <Loader2 size={12} className="animate-spin text-blue-400" />}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <Calendar size={13} className="text-gray-300" />
                                        {new Date(doc.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-[10px] font-black uppercase tracking-widest gap-2"
                                        onClick={() => setPreviewDoc(doc)}
                                    >
                                        View <ExternalLink size={12} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredDocuments.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={40} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium">No documents match your filters.</p>
                    </div>
                )}
            </div>
            {/* Preview Modal */}
            <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="px-6 py-4 border-b bg-white">
                        <DialogTitle className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                            <FileText size={20} />
                            {previewDoc?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs uppercase font-black tracking-widest text-gray-400">
                            DOC-ID: {previewDoc?.id.substring(0, 8)} | Type: {previewDoc?.type}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-4">
                        {previewDoc && (
                            <>
                                {isImage(previewDoc.fileUrl) ? (
                                    <img 
                                        src={previewDoc.fileUrl} 
                                        alt={previewDoc.name} 
                                        className="max-w-full max-h-full object-contain shadow-lg rounded-sm"
                                    />
                                ) : isPDF(previewDoc.fileUrl) ? (
                                    <iframe
                                        src={`${previewDoc.fileUrl}`}
                                        className="w-full h-full border-none bg-white shadow-lg rounded-sm"
                                        title={previewDoc.name}
                                    />
                                ) : (
                                    <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                                        <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
                                        <p className="text-lg font-bold text-gray-800">Preview Not Available</p>
                                        <p className="text-sm text-gray-500 mt-2">This file type cannot be previewed directly.</p>
                                        <a 
                                            href={previewDoc.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#1E3A8A] text-white hover:bg-blue-800 h-10 px-4 py-2"
                                        >
                                            Download Instead <Download className="ml-2 h-4 w-4" />
                                        </a>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
