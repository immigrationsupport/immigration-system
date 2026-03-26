import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function ClientDashboard() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const clientId = session.user.id;
    const isPending = (session.user as any).status === "PENDING";

    // 1. Fetch Stats
    const [totalApps, pendingApps, approvedApps, rejectedApps, recentApps] = await Promise.all([
        prisma.application.count({ where: { clientId } }),
        prisma.application.count({ where: { clientId, status: "PENDING" } }),
        prisma.application.count({ where: { clientId, status: "APPROVED" } }),
        prisma.application.count({ where: { clientId, status: "REJECTED" } }),
        prisma.application.findMany({
            where: { clientId },
            include: { procedures: { select: { type: true } } },
            orderBy: { updatedAt: "desc" },
            take: 5
        })
    ]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-[#1E3A8A] tracking-tight uppercase">Dashboard Overview</h1>
                <p className="text-gray-500 font-medium">Track your immigration status and document progress.</p>
            </div>

            {isPending && (
                <div className="bg-gray-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
                    <Clock className="h-6 w-6 text-amber-500" />
                    <div>
                        <h3 className="font-bold text-lg">Your account is awaiting admin validation.</h3>
                        <p className="text-sm">You have limited access until your account is approved. You cannot create applications or upload documents.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Applications */}
                <div

                    className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="p-4 rounded-2xl bg-blue-50 text-[#1E3A8A] group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                        <FileText size={26} color="black" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">Total Cases</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-0.5">{totalApps}</h3>
                    </div>
                </div>

                {/* Pending */}
                <div

                    className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="p-4 rounded-2xl bg-amber-50 text-[#1E3A8A] group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                        <Clock size={26} color="black" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">Pending</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-0.5">{pendingApps}</h3>
                    </div>
                </div>
                {/* Approved */}
                <div

                    className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="p-4 rounded-2xl bg-green-50 text-[#1E3A8A] group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                        <CheckCircle size={26} color="black" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">Success</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-0.5">{approvedApps}</h3>
                    </div>
                </div>
                {/* Rejected */}
                <div

                    className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="p-4 rounded-2xl bg-red-50 text-[#1E3A8A] group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                        <XCircle size={26} color="black" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">Action Req.</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-0.5">{rejectedApps}</h3>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden mt-8">
                <CardHeader className="bg-white border-b border-gray-50 py-6 px-8">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-black text-[#1E3A8A] uppercase tracking-tight">Active Applications</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Country</th>
                                    <th className="px-8 py-4">Type</th>
                                    <th className="px-8 py-4">Last Update</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {recentApps.length > 0 ? (
                                    recentApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-gray-900 text-base">{app.country}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex gap-1 flex-wrap">
                                                    {app.procedures.map((p, i) => (
                                                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                                            {p.type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-gray-500 font-medium whitespace-nowrap">
                                                {new Date(app.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${app.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                                    app.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                        app.status === "IN_REVIEW" ? "bg-amber-100 text-amber-700" :
                                                            "bg-blue-100 text-blue-700"
                                                    }`}>
                                                    {app.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link href={`/dashboard/client/applications/${app.id}`}>
                                                    <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#1E3A8A] px-4 py-2 rounded-xl text-xs font-black shadow-sm hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] transition-all">
                                                        View application <ArrowRight className="h-3 w-3" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold bg-gray-50/50">
                                            No applications found. Start by choosing a pathway.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

