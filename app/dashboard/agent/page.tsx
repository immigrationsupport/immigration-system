import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Clock, CheckCircle, MoreHorizontal, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function AgentDashboard() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "AGENT") {
        return null;
    }

    // Fetch stats and applications
    const [assignedApps, inReviewApps, completedApps] = await Promise.all([
        prisma.application.count({
            where: {
                OR: [{ agentId: session.user.id }, { client: { agentId: session.user.id } }]
            }
        }),
        prisma.application.count({
            where: {
                OR: [{ agentId: session.user.id }, { client: { agentId: session.user.id } }],
                status: "IN_REVIEW"
            }
        }),
        prisma.application.count({
            where: {
                OR: [{ agentId: session.user.id }, { client: { agentId: session.user.id } }],
                status: "APPROVED"
            }
        })
    ]);

    const recentApplications = await prisma.application.findMany({
        where: {
            OR: [{ agentId: session.user.id }, { client: { agentId: session.user.id } }]
        },
        include: {
            client: { select: { name: true, email: true } },
            steps: { select: { type: true, status: true, isLocked: true }, orderBy: { createdAt: "asc" } }
        },
        orderBy: { updatedAt: "desc" },
        take: 5
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight" style={{ color: "#1E3A8A" }}>Agent Overview</h1>
                    <p className="text-gray-500 font-medium">Welcome back to your workspace.</p>
                </div>
                <Link href="/dashboard/agent/profile">
                    <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-blue-50 hover:text-blue-700 font-bold gap-2">
                        <User className="h-4 w-4" /> My Profile
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div

                    className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="p-4 rounded-2xl bg-blue-50 text-[#1E3A8A] group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                        <Briefcase size={26} color="black" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">Total Applications</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-0.5">{assignedApps}</h3>
                    </div>
                </div>
                <div

                    className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="p-4 rounded-2xl bg-yellow-50 text-[#1E3A8A] group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                        <Clock size={26} color="black" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">In Review</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-0.5">{inReviewApps}</h3>
                    </div>
                </div>
                <div

                    className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 group"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="p-4 rounded-2xl bg-green-50 text-[#1E3A8A] group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                        <CheckCircle size={26} color="black" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black-400 font-black uppercase tracking-[0.2em]">Completed</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-0.5">{completedApps}</h3>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 py-6">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-tight">Recent Activity</CardTitle>
                        <Link href="/dashboard/agent/applications">
                            <Button variant="ghost" className="text-xs font-bold text-blue-600 hover:bg-blue-50">View All</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Applicant</th>
                                    <th className="px-6 py-4">Current Step</th>
                                    <th className="px-6 py-4">Last Update</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {recentApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-gray-900">{(app as any).client.name}</div>
                                            <div className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{app.country}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {(() => {
                                                const STEP_LABELS: Record<string, string> = {
                                                    REGISTRATION: "Registration",
                                                    CONTRACT_SIGNING: "Contract Signing",
                                                    FEE_PAYMENT: "Fee Payment",
                                                    DOCUMENT_COLLECTION: "Document Collection",
                                                    DIPLOMA_EQUIVALENCE: "Diploma Equivalence",
                                                    LANGUAGE_TEST_REGISTRATION: "Language Test Reg.",
                                                    LANGUAGE_TEST_RESULTS: "Language Test Results",
                                                    PROFILE_CREATION: "Profile Creation",
                                                    APPLICATION_SUBMISSION: "Application Submission",
                                                    MEDICAL_EXAMINATION: "Medical Examination",
                                                    PASSPORT_SUBMISSION: "Passport & Visa"
                                                };
                                                const activeStep = (app as any).steps.find((s: any) => s.status === "IN_PROGRESS" || (s.status === "PENDING" && !s.isLocked));
                                                const stepLabel = activeStep ? STEP_LABELS[activeStep.type] ?? activeStep.type : "Document Collection";
                                                return (
                                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold">
                                                        {stepLabel}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 font-medium whitespace-nowrap">
                                            {new Date(app.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${app.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                    app.status === "REJECTED" ? "bg-gra-100 text-red-700" :
                                                        app.status === "IN_REVIEW" ? "bg-gray-100 text-yellow-700" :
                                                            "bg-gray-100 text-blue-700"
                                                }`}>
                                                {app.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Link href={`/dashboard/agent/clients/${app.clientId}`}>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-9 w-9 p-0 rounded-xl border-gray-100 text-[#1E3A8A] hover:bg-blue-50 hover:border-blue-200 shadow-sm transition-all"
                                                    title="View Client Details"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {recentApplications.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-gray-500 font-bold">
                                            No recent activity found.
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
