import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ProcedureDetails from "./procedure-details";
import { Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApplicationHubPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const application = await prisma.application.findUnique({
        where: { id: params.id },
        include: {
            procedures: {
                include: {
                    documents: true,
                    application: true,
                    messages: {
                        orderBy: { createdAt: "asc" }
                    }
                },
                orderBy: { createdAt: "asc" }
            }
        }
    });

    if (!application || application.clientId !== session.user.id) {
        notFound();
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 bg-gray-50/30 min-h-screen">
            {/* Country Header */}
            <div className="bg-gradient-to-br from-[#1E3A8A] via-blue-800 to-blue-600 rounded-3xl p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-24 -mb-24 transition-transform duration-1000 group-hover:scale-110" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex gap-6 items-center">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-xl ring-2 ring-white/10 shadow-lg rotate-3 group-hover:rotate-0 transition-all duration-500">
                            <Globe className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{application.country}</h1>
                            <p className="text-blue-100 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                <span className="h-2 w-2 bg-blue-400 rounded-full" /> ATLE Immigration
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20 shadow-inner flex flex-col items-center">
                        <span className="text-xs font-black text-blue-200 uppercase tracking-widest mb-1">Global Status</span>
                        <span className="text-xl font-bold text-white uppercase drop-shadow-md">{application.status}</span>
                    </div>
                </div>
            </div>

            {/* Procedures Section */}
            <div className="grid grid-cols-1 gap-12">
                {application.procedures.map((proc) => (
                    <ProcedureDetails key={proc.id} procedure={proc} />
                ))}
            </div>
        </div>
    );
}
