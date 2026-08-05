import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Calendar, Users, Globe, Briefcase, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import ProfileForm from "./profile-form";
import { getTranslations } from "next-intl/server";

export default async function ClientProfilePage() {
    const t = await getTranslations("profile");
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            agent: true
        }
    });

    if (!user) return null;

    return (
        <div className="space-y-12 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b-4 border-[#1E3A8A]">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">{t("clientWorkspace")}</span>
                    <h1 className="text-6xl font-black text-[#1E3A8A] tracking-tighter uppercase leading-none">{t("myProfile")}</h1>
                    <p className="text-gray-500 font-bold tracking-tight mt-1">{t("subtitle")}</p>
                </div>
                <Link href="/dashboard/client">
                    <Button variant="outline" className="border-gray-200 text-gray-500 hover:bg-white hover:text-[#1E3A8A] font-black rounded-[20px] px-8 py-4 h-auto uppercase tracking-widest text-xs transition-all shadow-sm">
                        {t("continueToWorkspace")}
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-12">
                <ProfileForm user={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    nationality: user.nationality,
                    dateOfBirth: user.dateOfBirth,
                    maritalStatus: user.maritalStatus,
                    numberOfChildren: user.numberOfChildren,
                    address: user.address,
                    agent: user.agent
                }} />
            </div>
        </div>
    );
}