import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, MapPin, Phone, Calendar, Users, Globe, Briefcase, Mail } from "lucide-react";

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
        <div className="space-y-8 max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-[#1E3A8A] tracking-tight uppercase">My Profile</h1>
                <p className="text-gray-500 font-medium">Manage your personal information and see your assigned agent.</p>
            </div>

            {isPending && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
                    <div className="bg-amber-100 p-2 rounded-full">
                        <Users className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Your account is awaiting admin validation.</h3>
                        <p className="text-sm">You have limited access until your account is approved. You cannot create applications or upload documents.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <Card className="md:col-span-1 border-none shadow-xl shadow-gray-100 rounded-3xl overflow-hidden self-start">
                    <div className="h-32 bg-gradient-to-br from-[#1E3A8A] to-blue-600 flex items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-[#1E3A8A] text-4xl font-black">
                            {user.name?.[0].toUpperCase()}
                        </div>
                    </div>
                    <CardContent className="pt-16 text-center pb-8">
                        <h2 className="text-xl font-black text-gray-900">{user.name}</h2>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{user.role}</p>
                        
                        <div className="mt-8 space-y-3">
                            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl text-gray-600">
                                <Mail size={16} className="text-[#1E3A8A]" />
                                <span className="text-xs font-bold truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl text-gray-600">
                                <Phone size={16} className="text-[#1E3A8A]" />
                                <span className="text-xs font-bold">{user.phoneNumber || "No phone added"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Detailed Info & Agent */}
                <div className="md:col-span-2 space-y-8">
                    {/* Personal Details */}
                    <Card className="border-none shadow-xl shadow-gray-100 rounded-3xl">
                        <CardHeader className="border-b border-gray-50 flex flex-row items-center gap-3 py-6">
                            <User className="h-5 w-5 text-[#1E3A8A]" />
                            <CardTitle className="text-lg font-black text-gray-900 uppercase tracking-tight">Personal Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={12} className="text-blue-500" /> Nationality
                                </p>
                                <p className="text-sm font-bold text-gray-900">{user.nationality || "Not specified"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={12} className="text-blue-500" /> Date of Birth
                                </p>
                                <p className="text-sm font-bold text-gray-900">
                                    {user.dateOfBirth ? user.dateOfBirth.toLocaleDateString() : "Not specified"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={12} className="text-blue-500" /> Marital Status
                                </p>
                                <p className="text-sm font-bold text-gray-900">{user.maritalStatus || "Not specified"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={12} className="text-blue-500" /> Children
                                </p>
                                <p className="text-sm font-bold text-gray-900">{user.numberOfChildren} children</p>
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={12} className="text-blue-500" /> Residential Address
                                </p>
                                <p className="text-sm font-bold text-gray-900 leading-relaxed">{user.address || "Not specified"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned Agent */}
                    <Card className="border-none shadow-xl shadow-blue-50/50 rounded-3xl bg-gradient-to-br from-white to-blue-50/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4">
                            <Briefcase size={40} className="text-blue-100/50" />
                        </div>
                        <CardHeader className="py-6">
                            <CardTitle className="text-lg font-black text-[#1E3A8A] uppercase tracking-tight">Your Assigned Specialist</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-8 flex items-center gap-6">
                            {user.agent ? (
                                <>
                                    <div className="w-16 h-16 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">
                                        {user.agent.name[0].toUpperCase()}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-gray-900">{user.agent.name}</h3>
                                        <p className="text-sm font-bold text-blue-600 uppercase tracking-tighter">Certified Immigration Agent</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                                            <Mail size={12} />
                                            <span className="font-medium">{user.agent.email}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-400 font-bold italic py-4">
                                    No agent assigned yet. A specialist will be assigned to your case shortly.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
