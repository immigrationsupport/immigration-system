import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Calendar, FileText, Clock, Send, Shield, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import SendMessageModal from "./send-message-modal";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "AGENT") {
        return null;
    }

    const { id } = await params;

    const client = await prisma.user.findUnique({
        where: { id, agentId: session.user.id },
        include: {
            applications: {
                include: {
                    procedures: {
                        include: {
                            documents: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" }
            },
            documents: true,
            receivedMessages: {
                where: { senderId: session.user.id },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!client) {
        notFound();
    }

    // Fetch action history (audit logs)
    const logs = await prisma.auditLog.findMany({
        where: {
            OR: [
                { targetId: id },
                { details: { contains: id } }
            ]
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">
                        {client.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{client.name}</h1>
                        <p className="text-gray-500 font-medium flex items-center gap-2">
                           <Shield className="h-4 w-4 text-blue-500" /> Assigned Client
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-white border-b border-gray-50 py-6">
                            <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-500" /> Personal Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address</label>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Mail className="h-4 w-4 text-gray-400" /> {client.email}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone Number</label>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Phone className="h-4 w-4 text-gray-400" /> {client.phoneNumber || "Not provided"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nationality</label>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <MapPin className="h-4 w-4 text-gray-400" /> {client.nationality || "Not specified"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Date of Birth</label>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Calendar className="h-4 w-4 text-gray-400" /> {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "Not provided"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="border-none shadow-xl shadow-blue-50/50 rounded-2xl bg-[#1E3A8A] text-white">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] font-black text-blue-200 uppercase tracking-wider mb-1">Applications</div>
                                    <div className="text-2xl font-black">{client.applications.length}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-blue-200 uppercase tracking-wider mb-1">Documents</div>
                                    <div className="text-2xl font-black">{client.documents.length}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Applications Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                            <Briefcase className="h-5 w-5 text-blue-600" /> Immigration Applications
                        </h2>
                        {client.applications.length > 0 ? (
                            client.applications.map((app) => (
                                <Card key={app.id} className="border-none shadow-lg shadow-gray-100/50 rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-white border-b border-gray-50 flex flex-row justify-between items-center py-4">
                                        <div>
                                            <CardTitle className="text-sm font-black text-gray-900">
                                                {app.country} - Pathway Case
                                            </CardTitle>
                                            <p className="text-[9px] font-mono text-gray-400 uppercase">{app.id}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                            app.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                            app.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                            "bg-blue-100 text-blue-700"
                                        }`}>
                                            {app.status.replace(/_/g, " ")}
                                        </span>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {app.procedures.map((proc) => (
                                                <div key={proc.id} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div>
                                                            <div className="text-xs font-black text-gray-900 uppercase">Step: {proc.type}</div>
                                                            <div className="text-[10px] text-gray-500">{proc.documents.length} documents attached</div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{proc.status}</span>
                                                    </div>
                                                    
                                                    {proc.documents.map((doc) => (
                                                        <div key={doc.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-lg border border-gray-100 gap-3">
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-800">{doc.name}</div>
                                                                <div className="text-[10px] uppercase font-mono text-gray-400 mt-1">{doc.type.replace(/_/g, " ")} • {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <a 
                                                                    href={doc.fileUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1"
                                                                >
                                                                    <FileText className="h-3 w-3" /> View Document
                                                                </a>
                                                                <SendMessageModal 
                                                                    clientId={id} 
                                                                    clientName={client.name} 
                                                                    defaultSubject={`Modification Request: document ${doc.name}`}
                                                                    buttonText="Request Mod"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {proc.documents.length === 0 && (
                                                        <div className="text-[10px] text-gray-400 font-mediumitalic p-2">Waitng for client to attach documents.</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold">No applications submitted yet.</p>
                            </div>
                        )}
                    </div>

                    {/* History Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                            <Clock className="h-5 w-5 text-blue-600" /> Action History & Audit
                        </h2>
                        <Card className="border-none shadow-lg shadow-gray-100/50 rounded-2xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    {logs.map((log) => (
                                        <div key={log.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">
                                                    {log.action.replace(/_/g, " ")}
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-medium">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-700 leading-snug">{log.details}</p>
                                            <p className="text-[9px] text-gray-400 mt-1 font-mono uppercase">Ref: LOG-{log.logNumber?.toString().padStart(4, '0') || "N/A"}</p>
                                        </div>
                                    ))}
                                    {logs.length === 0 && (
                                        <div className="p-8 text-center text-gray-400 text-sm font-medium">
                                            No action logs recorded for this client.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
