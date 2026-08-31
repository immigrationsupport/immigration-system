import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { User, Mail, Calendar, MapPin, Shield, Phone, CreditCard, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import ChangePasswordButton from "@/components/ChangePasswordButton";
import { getTranslations, getLocale } from "next-intl/server";

export default async function AgentProfilePage() {
    const t = await getTranslations("agentProfile");
    const locale = await getLocale();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return null;
    }

    // Fetch fresh info from DB to be sure
    const agent = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!agent) return <div>{t("agentNotFound")}</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 px-4 py-10">
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-3xl shadow-xl shadow-blue-50/50 border border-gray-100">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#1E3A8A] to-blue-500 flex items-center justify-center text-white text-5xl font-black shadow-lg ring-8 ring-blue-50">
                    {agent.name.charAt(0)}
                </div>
                <div className="text-center md:text-left space-y-2 flex-1">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{agent.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <span className="inline-flex items-center px-4 py-1.5 text-sm font-bold bg-white-100 text-[#1E3A8A] ">
                            <Shield className="w-4 h-4 mr-2" /> {t("authorizedAgent")}
                        </span>
                        <span className="inline-flex items-center px-4 py-1.5  text-sm font-bold bg-white-100 text-green-700 ">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> {t("activeStatus")}
                        </span>
                    </div>
                
                </div>
                <ChangePasswordButton />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <User className="w-5 h-5 text-[#1E3A8A]" /> {t("personalInformation")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-gray-700">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("emailAddress")}</p>
                                <p className="text-base font-bold text-gray-800">{agent.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-gray-700">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("phoneNumber")}</p>
                                <p className="text-base font-bold text-gray-800">{agent.phoneNumber || t("notProvided")}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-gray-700">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("locationOffice")}</p>
                                <p className="text-base font-bold text-gray-800">{agent.address || t("globalHqRemote")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none   overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Award className="w-5 h-5 text-[#1E3A8A]" /> {t("professionalDetails")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-gray-700">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("joinedOn")}</p>
                                <p className="text-base font-bold text-gray-800">{new Date(agent.createdAt).toLocaleDateString(locale, { dateStyle: 'long' })}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-gray-700">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("professionalId")}</p>
                                <p className="text-base font-bold text-gray-800">AGT-{agent.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <p className="text-sm font-bold text-[#1E3A8A]">{t("profileNote")}</p>
                            <p className="text-sm text-black-600/80 mt-1 italic">{t("profileNoteText")}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}