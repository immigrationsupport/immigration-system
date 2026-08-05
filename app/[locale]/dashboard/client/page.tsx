import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import ContactAgencyButton from "@/components/ContactAgencyButton";

export default async function ClientDashboard() {
    const t = await getTranslations("dashboard.clientDashboard");
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const clientId = session.user.id;
    
    // Default values in case the DB query fails
    let totalApps = 0, pendingApps = 0, approvedApps = 0, rejectedApps = 0;
    let recentAppsRaw: any[] = [];

    try {
        // Fetch Stats with individual try/catch or Promise.all
        const results = await Promise.all([
            prisma.application.count({ where: { clientId } }),
            prisma.application.count({ where: { clientId, status: "PENDING" } }),
            prisma.application.count({ where: { clientId, status: "APPROVED" } }),
            prisma.application.count({ where: { clientId, status: "REJECTED" } }),
            prisma.application.findMany({
                where: { clientId },
                include: { 
                    steps: { select: { status: true, type: true, isLocked: true } }
                },
                orderBy: { updatedAt: "desc" },
                take: 5
            })
        ]);

        [totalApps, pendingApps, approvedApps, rejectedApps, recentAppsRaw] = results;
    } catch (error) {
        console.error("[DASHBOARD_ERROR]: Database query failed. Check if columns exist.", error);
    }

    const recentApps = (recentAppsRaw || []).map((app: any) => {
        const steps = app.steps || [];
        const completedSteps = steps.filter((s: any) => s.status === "APPROVED").length;
        const totalSteps = steps.length || 1; // Avoid division by zero
        return {
            ...app,
            progress: Math.round((completedSteps / totalSteps) * 100),
            completedSteps,
            totalSteps
        };
    });

    const profileCompleted = (session.user as any).profileCompleted;

    // Fetch Action Required count from steps
    const actionRequiredCount = await prisma.application.count({
        where: { 
            clientId,
            steps: { some: { status: "ACTION_REQUIRED" } }
        }
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-[#1E3A8A] tracking-tight uppercase">{t("title")}</h1>
                    <p className="text-gray-500 font-medium tracking-tight">{t("subtitle")}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FileText size={26} />} label={t("statCards.totalCases")} value={totalApps} color="blue" />
                <StatCard icon={<Clock size={26} />} label={t("statCards.pending")} value={pendingApps} color="amber" />
                <StatCard icon={<CheckCircle size={26} />} label={t("statCards.success")} value={approvedApps} color="green" />
                <StatCard 
                    icon={<XCircle size={26} className={actionRequiredCount > 0 ? "animate-pulse" : ""} />} 
                    label={t("statCards.actionReq")} 
                    value={actionRequiredCount} 
                    color="red" 
                    link="/dashboard/client/messages"
                    isUrgent={actionRequiredCount > 0}
                />
            </div>

            {/* Applications Table */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden mt-8">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">{t("tableHeaders.country")}</th>
                                    <th className="px-8 py-4">{t("tableHeaders.currentStep")}</th>
                                    <th className="px-8 py-4">{t("tableHeaders.progress")}</th>
                                    <th className="px-8 py-4 text-right">{t("tableHeaders.action")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {recentApps.length > 0 ? (
                                    recentApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-8 py-5 font-bold">{app.country}</td>
                                            <td className="px-8 py-5 text-xs font-bold">
                                                {(() => {
                                                    const STEP_KEYS = [
                                                        "REGISTRATION", "CONTRACT_SIGNING", "FEE_PAYMENT",
                                                        "DOCUMENT_COLLECTION", "DIPLOMA_EQUIVALENCE",
                                                        "LANGUAGE_TEST_REGISTRATION", "LANGUAGE_TEST_RESULTS",
                                                        "PROFILE_CREATION", "APPLICATION_SUBMISSION",
                                                        "MEDICAL_EXAMINATION", "PASSPORT_SUBMISSION"
                                                    ];
                                                    const steps = app.steps || [];
                                                    const activeStep = steps.find((s: any) => s.status === "ACTION_REQUIRED" || s.status === "IN_PROGRESS" || (s.status === "PENDING" && !s.isLocked));
                                                    const activeType = (activeStep as any)?.type;
                                                    const stepLabel = activeType && STEP_KEYS.includes(activeType)
                                                        ? t(`stepLabels.${activeType}` as any)
                                                        : activeType ?? t("stepLabels.DOCUMENT_COLLECTION");
                                                    
                                                    return (
                                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                                                            (activeStep as any)?.status === "ACTION_REQUIRED" 
                                                            ? "bg-red-50 text-red-700" 
                                                            : "bg-blue-50 text-blue-700"
                                                        }`}>
                                                            {stepLabel}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600" style={{ width: `${app.progress}%` }} />
                                                    </div>
                                                    <span className="text-[10px]">{app.completedSteps}/{app.totalSteps}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link href={`/dashboard/client/applications/${app.id}`}>
                                                    <Button variant="outline" size="sm">{t("viewApplication")}</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-gray-400">{t("noApplications")}</td>
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

// Reusable StatCard for cleaner code
function StatCard({ icon, label, value, color, link, isUrgent }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
    };

    const content = (
        <div className={`bg-white p-6 shadow-sm border ${isUrgent ? 'border-red-200 ring-2 ring-red-50 animate-in fade-in' : 'border-gray-100'} flex items-center gap-5 rounded-2xl transition-all hover:shadow-md cursor-pointer group`}>
            <div className={`p-4 rounded-2xl transition-all ${colors[color]} ${isUrgent ? 'animate-pulse' : ''} group-hover:scale-110`}>{icon}</div>
            <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-gray-900">{value}</h3>
                    {link && <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />}
                </div>
            </div>
        </div>
    );

    if (link) {
        return <Link href={link}>{content}</Link>;
    }

    return content;
}