"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Save, Info, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { updateApplicationStatusAction } from "./actions";

interface Application {
    id: string;
    type: string;
    country: string;
    status: string;
    createdAt: Date;
    client: {
        name: string;
    }
}

interface ApplicationListProps {
    initialApplications: any[];
}

export default function ApplicationList({ initialApplications }: ApplicationListProps) {
    const [applications, setApplications] = useState(initialApplications);

    return (
        <div className="grid grid-cols-1 space-y-6">
            {applications.map((app) => (
                <ApplicationCard
                    key={app.id}
                    app={app}
                />
            ))}
            {applications.length === 0 && (
                <Card className="flex flex-col items-center py-20 bg-gray-50 border-dashed">
                    <Info className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium">No assigned applications found.</p>
                </Card>
            )}
        </div>
    );
}

function ApplicationCard({ app }: { app: any }) {
    const [status, setStatus] = useState(app.status);
    const [note, setNote] = useState("");
    const [showNotes, setShowNotes] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modificationRequested, setModificationRequested] = useState(false);
    const [modMessage, setModMessage] = useState("");

    const handleSave = async (newStatus?: string) => {
        setLoading(true);
        const targetStatus = newStatus || status;
        const res = await updateApplicationStatusAction(app.id, targetStatus, targetStatus === "MODIFICATION_REQUESTED" ? modMessage : note);
        setLoading(false);
        if (res.error) alert(res.error);
        else {
            setModificationRequested(false);
            window.location.reload();
        }
    };

    return (
        <Card className="overflow-hidden border-gray-200 hover:border-blue-200 transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gray-50/50 border-b">
                <div className="flex gap-4 items-center">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">
                            {app.client.name} — {app.country}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                            {app.procedures.map((p: any) => (
                                <span key={p.id} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ring-1 ring-blue-100">{p.type}</span>
                            ))}
                        </CardDescription>
                    </div>
                </div>
                <div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${app.status === "APPROVED" ? "bg-green-100 text-green-800 border border-green-200" :
                        app.status === "REJECTED" ? "bg-red-100 text-red-800 border border-red-200" :
                            app.status === "IN_REVIEW" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                                app.status === "MODIFICATION_REQUESTED" ? "bg-orange-100 text-orange-800 border border-orange-200" :
                                    "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}>
                        {app.status.replace("_", " ")}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Status Management */}
                    <div className="space-y-4 bg-gray-50/30 p-4 rounded-xl border border-gray-100">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Update Status</label>
                        <div className="flex gap-3">
                            <select
                                className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm outline-none transition-all"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="PENDING">Pending Review</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <Button
                                onClick={() => handleSave()}
                                className="h-11 px-6 font-bold transition-all shadow-md hover:shadow-lg rounded-lg"
                                style={{ backgroundColor: "#1e3a8a", color: "white" }}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save
                            </Button>
                        </div>

                        {!modificationRequested ? (
                            <Button
                                variant="outline"
                                className="w-full text-orange-700 border-orange-200 mt-2 bg-orange-50 hover:bg-orange-100 h-11 font-bold rounded-lg transition-colors"
                                onClick={() => setModificationRequested(true)}
                                disabled={loading}
                            >
                                <RefreshCcw className="h-4 w-4 mr-2" /> Request Modification
                            </Button>
                        ) : (
                            <div className="mt-3 space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-inner animate-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-orange-800 uppercase tracking-wide">Reason for Modification</label>
                                <textarea
                                    className="w-full h-24 p-3 text-sm rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                                    placeholder="Explain why client needs to modify documents/info..."
                                    value={modMessage}
                                    onChange={(e) => setModMessage(e.target.value)}
                                ></textarea>
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg h-10 shadow-sm"
                                        onClick={() => handleSave("MODIFICATION_REQUESTED")}
                                        disabled={loading || !modMessage.trim()}
                                    >
                                        Send Request
                                    </Button>
                                    <Button variant="ghost" onClick={() => setModificationRequested(false)} className="h-10 text-gray-500">Cancel</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Info & Notes */}
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Client Contact Info</h4>
                            <div className="space-y-2">
                                <p className="text-sm"><strong>Name:</strong> {app.client.name}</p>
                                <p className="text-sm"><strong>Email:</strong> {app.client.email}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    Internal Note (for next status change)
                                </label>
                            </div>
                            <textarea
                                className="flex w-full rounded-xl border border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all min-h-[100px]"
                                placeholder="Add an internal note about this application for the notification/audit..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
