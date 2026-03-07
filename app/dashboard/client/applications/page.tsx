import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Plus, Globe, ArrowRight, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MyApplicationsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const applications = await prisma.application.findMany({
        where: { clientId: session.user.id },
        include: {
            procedures: {
                orderBy: { createdAt: "desc" }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900" style={{ color: "#1E3A8A" }}>My Immigration Hub</h1>
                    <p className="text-gray-500 mt-2 text-lg">Track your applications and procedures across different countries.</p>
                </div>
                <Link
                    href="/applications/new"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl shadow-lg text-white bg-[#1E3A8A] hover:bg-blue-900 transition-all hover:scale-105 font-bold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Application
                </Link>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
                    <Globe className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">No applications found</h3>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">Start your journey by creating your first application for a destination country.</p>
                    <Link href="/applications/new">
                        <Button className="mt-6 bg-[#1E3A8A] rounded-lg px-8">Get Started</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {applications.map((app) => (
                        <Card key={app.id} className="overflow-hidden border-none shadow-xl shadow-blue-50/50 hover:shadow-2xl hover:shadow-blue-100/50 transition-all rounded-3xl bg-white">
                            <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-600 px-8 py-6 flex justify-between items-center text-white">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                                        <Globe className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight">{app.country}</h2>
                                        <p className="text-xs font-bold uppercase tracking-widest text-blue-100">Destination Country</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border ${app.status === "APPROVED" ? "bg-green-500/20 text-green-100 border-green-500/30" :
                                        app.status === "REJECTED" ? "bg-red-500/20 text-red-100 border-red-500/30" :
                                            "bg-white/20 text-white border-white/30"
                                        }`}>
                                        {app.status}
                                    </span>
                                    <Link href={`/dashboard/client/applications/${app.id}`}>
                                        <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl px-4 h-10 font-bold border border-white/20">
                                            View Hub <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <CardContent className="p-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Procedures ({app.procedures.length})</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {app.procedures.map((proc) => (
                                            <div key={proc.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all group flex flex-col justify-between h-full">
                                                <div>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#1E3A8A] text-white shadow-sm ring-2 ring-blue-50">{proc.type}</span>
                                                        <span className={`text-[10px] font-bold uppercase ${proc.isLocked ? "text-red-500" : "text-green-500"}`}>{proc.isLocked ? "LOCKED" : "EDITABLE"}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-800 line-clamp-2 mb-4 group-hover:text-blue-900 transition-colors">{proc.description || "No description provided"}</p>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                                    <div className="flex items-center gap-1.5">
                                                        {proc.status === "PENDING" ? <Clock className="h-3 w-3 text-yellow-500" /> : <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{proc.status.replace("_", " ")}</span>
                                                    </div>
                                                    <Link href={`/dashboard/client/applications/${app.id}`}>
                                                        <span className="text-[10px] font-bold text-[#1E3A8A] flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">Manage <ArrowRight className="h-3 w-3" /></span>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}

                                        <Link href={`/dashboard/client/applications/${app.id}`} className="p-5 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                                            <Plus className="h-6 w-6" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Add Pathway</span>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
