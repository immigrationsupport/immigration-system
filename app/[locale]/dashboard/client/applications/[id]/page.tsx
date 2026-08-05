import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Globe, Briefcase, GraduationCap, Users } from "lucide-react";import ApplicationStepper from "./application-stepper";
import { APP_STEP_SEQUENCE } from "@/lib/steps";
import { getTranslations } from "next-intl/server";

export default async function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const { id } = await (params as any);
    const t = await getTranslations("applications.detail");
    const tTypes = await getTranslations("applications.types");
    const tStatuses = await getTranslations("applications.statuses");
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    let application = await prisma.application.findUnique({
        where: { id: id },
        include: {
            steps: {
                include: { Document: true },
                orderBy: { updatedAt: "asc" }
            }
        }
    });

    if (application && application.steps.length < 11) {
        // Auto-repair legacy applications
        const appId = application.id;
        const existingTypes = application.steps.map((s: any) => s.type);
        const missingSteps = APP_STEP_SEQUENCE.filter((type: string) => !existingTypes.includes(type));
        
        if (missingSteps.length > 0) {
            await prisma.applicationStep.createMany({
                data: missingSteps.map((type: string) => {
                    const realIndex = APP_STEP_SEQUENCE.indexOf(type as any);
                    return {
                        applicationId: appId,
                        type: type as any,
                        status: realIndex < 3 ? "APPROVED" : (realIndex === 3 ? "IN_PROGRESS" : "PENDING"),
                        isLocked: realIndex < 3 ? false : (realIndex === 3 ? false : true),
                    };
                })
            });

            application = await prisma.application.findUnique({
                where: { id: id },
                include: {
                    steps: {
                        include: { Document: true },
                        orderBy: { updatedAt: "asc" }
                    }
                }
            });
        }
    }

    if (!application || application.clientId !== session.user.id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
                <div className="text-center space-y-6 max-w-sm">
                    <div className="bg-red-50 text-red-500 p-6 rounded-3xl shadow-xl shadow-red-100 flex items-center justify-center">
                        <ArrowLeft className="h-10 w-10 rotate-45" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{t("accessRestricted")}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{t("accessRestrictedDesc")}</p>
                    <Link href="/dashboard/client">
                        <button className="bg-[#1E3A8A] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl shadow-blue-100 active:scale-95">{t("returnToDashboard")}</button>
                    </Link>
                </div>
            </div>
        );
    }

    const completedSteps = application.steps.filter(s => s.status === "APPROVED").length;
    const progress = Math.round((completedSteps / application.steps.length) * 100);
    const appType = application.type || "GENERAL";

    return (
        <div className="min-h-screen bg-[#FDFDFF] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-4">
                   <Link href="/dashboard/client" className="inline-flex items-center gap-2 group text-gray-400 hover:text-[#1E3A8A] transition-all">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t("backToOverview")}</span>
                   </Link>
                   
                   <div className="flex items-center gap-6">
                        <div className="bg-[#1E3A8A] p-4 rounded-3xl text-white shadow-2xl shadow-blue-100">
                            <Globe size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{t("applicationTracking")}</span>
                                <span className="h-1 w-1 bg-gray-300 rounded-full" />
                                <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
                                    application.status === "COMPLETED" ? "text-emerald-500" : "text-blue-500"
                                }`}>
                                    {tStatuses(application.status as any)}
                                </span>
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">{application.country} {t("journeySuffix")}</h1>
                        </div>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-50 flex flex-col items-end gap-2 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("currentPathway")}</p>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-xl text-blue-700 shadow-inner">
                            {appType === "WORK" ? <Briefcase size={20} /> :
                            appType === "STUDY" ? <GraduationCap size={20} /> :
                            <Users size={20} />}
                        </div>
                        <span className="text-2xl font-black text-[#1E3A8A] tracking-tight">{tTypes(appType as any)}</span>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white p-6 rounded border border-gray-200 shadow-sm mt-8">
                <ApplicationStepper 
                    steps={application.steps} 
                    applicationId={application.id} 
                    country={application.country}
                />
            </div>

        </div>
    );
}