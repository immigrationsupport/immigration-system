import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Calendar, Users, Globe, Briefcase, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProfileForm from "./profile-form";

export default async function ClientProfilePage() {
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

    const isPending = user.status === "PENDING";

    return (
        <div className="space-y-12 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b-4 border-[#1E3A8A]">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Client Workspace</span>
                    <h1 className="text-6xl font-black text-[#1E3A8A] tracking-tighter uppercase leading-none">My Profile</h1>
                    <p className="text-gray-500 font-bold tracking-tight mt-1">Manage your identity and contact information.</p>
                </div>
                <Link href="/dashboard/client">
                    <Button variant="outline" className="border-gray-200 text-gray-500 hover:bg-white hover:text-[#1E3A8A] font-black rounded-[20px] px-8 py-4 h-auto uppercase tracking-widest text-xs transition-all shadow-sm">
                        Continue to Workspace
                    </Button>
                </Link>
            </div>

            {isPending && (
                <div className="bg-amber-50 border-4 border-amber-200 text-amber-900 px-8 py-6 rounded-[40px] flex items-center gap-6 shadow-2xl shadow-amber-100/50 animate-pulse">
                    <div className="bg-amber-100 p-4 rounded-3xl">
                        <Users className="h-10 w-10 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-2xl uppercase tracking-tighter">Account Under Review</h3>
                        <p className="font-bold opacity-75">Your registration is currently pending admin validation. Access is limited.</p>
                    </div>
                </div>
            )}

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

