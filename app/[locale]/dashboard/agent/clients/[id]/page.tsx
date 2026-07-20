import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Calendar, FileText, Clock, Send, Shield, Briefcase, Globe, ArrowRight, CheckCircle2, Lock, Circle, ExternalLink, XCircle } from "lucide-react";
import { STEP_LABELS, APP_STEP_SEQUENCE } from "@/lib/steps";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import SendMessageModal from "./send-message-modal";
import { getLocale } from "next-intl/server";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
    const locale = await getLocale();
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
                    steps: {
                        include: {
                            Document: true
                        },
                        orderBy: { updatedAt: "asc" }
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
                                    <Calendar className="h-4 w-4 text-gray-400" /> {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString(locale) : "Not provided"}
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
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                             <div className="space-y-1">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
                                    <Globe className="h-6 w-6 text-blue-600" /> Journey Roadmaps
                                </h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-9">Active Case Files & Submissions</p>
                             </div>
                             <Link href="/dashboard/agent/applications">
                                <Button variant="outline" className="rounded-2xl text-[10px] font-black uppercase tracking-widest px-6 h-12 shadow-sm border-gray-100 hover:bg-blue-50 hover:text-blue-700 transition-all">
                                    Full Roadmap Admin <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                             </Link>
                        </div>

                        {client.applications.length > 0 ? (
                            client.applications.map((app) => (
                                <Card key={app.id} className="border-none shadow-2xl shadow-blue-50/50 rounded-[40px] overflow-hidden bg-white group hover:shadow-blue-100/50 transition-all duration-700">
                                    <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-600 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-inner">
                                                <Globe className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                                                    {app.country}
                                                </CardTitle>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Active Case</span>
                                                    <span className="h-1 w-1 bg-blue-300 rounded-full" />
                                                    <span className="text-[10px] font-mono text-blue-200">{app.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl backdrop-blur-md border relative z-10 ${
                                            app.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30" :
                                            app.status === "REJECTED" ? "bg-red-500/20 text-red-100 border-red-500/30" :
                                            "bg-white/20 text-white border-white/30"
                                        }`}>
                                            {app.status.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    <CardContent className="p-10 space-y-12">
                                        {/* Roadmap Flow View */}
                                        <div className="relative">
                                            <div className="absolute left-[31px] top-6 bottom-6 w-1 bg-gray-50 rounded-full" />
                                            
                                            <div className="space-y-6">
                                                {(app as any).steps.sort((a: any, b: any) => {
                                                    const idxA = APP_STEP_SEQUENCE.indexOf(a.type as any);
                                                    const idxB = APP_STEP_SEQUENCE.indexOf(b.type as any);
                                                    return idxA - idxB;
                                                }).map((proc: any, idx: number) => (
                                                    <div key={proc.id} className="relative pl-20 group/step">
                                                        {/* Icon/Circle */}
                                                        <div className={`absolute left-0 top-0 h-16 w-16 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl border-4 border-white z-10 ${
                                                            proc.status === "APPROVED" ? "bg-emerald-500 text-white shadow-emerald-100" :
                                                            proc.isLocked ? "bg-red-50 text-red-300 border-red-50" :
                                                            "bg-[#1E3A8A] text-white shadow-blue-100"
                                                        }`}>
                                                            {proc.status === "APPROVED" ? <CheckCircle2 size={24} /> : 
                                                             proc.isLocked ? <Lock className="h-6 w-6" /> : 
                                                             <Circle className="h-3 w-3" fill="currentColor" />}
                                                        </div>

                                                        {/* Content Card */}
                                                        <div className="p-8 bg-gray-50/50 hover:bg-white rounded-[32px] border border-gray-100 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group-hover/step:translate-x-2">
                                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8" title="Click Phase for Admin Dashboard Controls">
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Phase 0{idx + 1}</span>
                                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                                            proc.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                                                                            "bg-blue-50 text-blue-600"
                                                                        }`}>{proc.status.replace(/_/g, " ")}</span>
                                                                    </div>
                                                                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{STEP_LABELS[proc.type as keyof typeof STEP_LABELS] || proc.type}</h4>
                                                                </div>
                                                                <Link href={`/dashboard/agent/applications/${app.id}`}>
                                                                    <Button variant="ghost" className="rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] hover:bg-blue-50 border border-transparent hover:border-blue-100">
                                                                        Manage Decision <ArrowRight className="ml-2 h-3 w-3" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {proc.Document.map((doc: any) => (
                                                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all group/doc">
                                                                        <div className="flex items-center gap-4 overflow-hidden">
                                                                            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover/doc:bg-[#1E3A8A] group-hover/doc:text-white transition-all duration-300">
                                                                                <FileText size={20} />
                                                                            </div>
                                                                            <div className="overflow-hidden">
                                                                                <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{doc.name.replace(/_/g, " ")}</p>
                                                                                <p className="text-[9px] font-bold text-gray-400 uppercase">{doc.type.replace(/_/g, " ")}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <a 
                                                                                href={doc.fileUrl} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                            >
                                                                                <ExternalLink size={18} />
                                                                            </a>
                                                                            <SendMessageModal 
                                                                                clientId={id} 
                                                                                clientName={client.name} 
                                                                                defaultSubject={`Evidence Required: ${doc.name}`}
                                                                                buttonText={<div className="flex items-center gap-1.5"><XCircle size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Reject evidence</span></div>}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {proc.Document.length === 0 && idx >= 3 && (
                                                                    <div className="md:col-span-2 py-10 flex flex-col items-center justify-center bg-white/50 border border-gray-100 rounded-3xl italic">
                                                                        <Clock className="h-6 w-6 text-gray-200 mb-2" />
                                                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Awaiting client attachments...</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="p-24 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-100 shadow-xl shadow-blue-50/20">
                                <Globe className="h-16 w-16 text-gray-100 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No Active Journeys</h3>
                                <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">This client hasn't started any immigration applications yet.</p>
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
                                                    {new Date(log.createdAt).toLocaleString(locale)}
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