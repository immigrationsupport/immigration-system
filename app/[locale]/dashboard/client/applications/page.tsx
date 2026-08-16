import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Link } from "@/i18n/routing";
import { Globe, ArrowRight, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function MyApplicationsPage() {
    const t = await getTranslations("applications");
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const applications = await prisma.application.findMany({
        where: { clientId: session.user.id },
        include: {
            steps: {
                orderBy: { order: "asc" }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900" style={{ color: "#1E3A8A" }}>{t("myApplications")}</h1>
                    <p className="text-gray-500 mt-2 text-lg">{t("subtitle")}</p>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
                    <Globe className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">{t("noApplications")}</h3>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">{t("noApplicationsDesc")}</p>
                    <p className="text-gray-400 mt-4 text-sm font-bold uppercase tracking-widest">Contact your agent to start your first application.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((app) => {
                        const APP_TYPE_KEYS = ["PR", "WORK", "STUDY", "SCHOLARSHIP"];
                        const appTypeLabel = APP_TYPE_KEYS.includes(app.type)
                            ? t(`types.${app.type}` as any)
                            : t("types.GENERAL");
                        const STATUS_KEYS = [
                            "PENDING", "IN_REVIEW", "MODIFICATION_REQUESTED", "APPROVED",
                            "REJECTED", "COMPLETED", "CANCELLED", "IN_PROGRESS", "SUBMITTED", "VALIDATED"
                        ];
                        const statusLabel = STATUS_KEYS.includes(app.status)
                            ? t(`statuses.${app.status}` as any)
                            : app.status.replace("_", " ");

                        return (
                            <Card key={app.id} className="overflow-hidden border-none shadow-xl shadow-blue-50/50 hover:shadow-2xl hover:shadow-blue-100/50 transition-all rounded-[32px] bg-white group border border-transparent hover:border-blue-100">
                                <CardContent className="p-0">
                                    {/* Link wrapper for the whole card but keeping the button clickable */}
                                    <div className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="bg-blue-50 p-4 rounded-2xl text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-all duration-300">
                                                <Globe className="h-6 w-6" />
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                app.status === "APPROVED" || app.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                app.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-100" :
                                                "bg-blue-50 text-blue-600 border-blue-100"
                                            }`}>
                                                {statusLabel}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-[#1E3A8A] transition-colors">
                                                {appTypeLabel}
                                            </h3>
                                            <p className="flex items-center gap-2 text-sm font-bold text-gray-400">
                                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                                                {app.country}
                                            </p>
                                        </div>

                                        <div className="pt-4 flex flex-col gap-3">
                                            <Link href={`/dashboard/client/applications/${app.id}`} className="w-full">
                                                <Button className="w-full bg-[#1E3A8A] hover:bg-blue-900 text-white font-black py-6 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group-hover:translate-y-[-2px] transition-all">
                                                    {t("manageApplication")}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}