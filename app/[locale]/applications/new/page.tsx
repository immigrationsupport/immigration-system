"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewApplicationPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-xl border-gray-100 overflow-hidden rounded-[32px]">
                    <CardHeader className="bg-white border-b border-gray-100 p-8">
                        <CardTitle className="text-2xl font-black text-[#1E3A8A] uppercase tracking-tight">Starting a New Procedure</CardTitle>
                        <CardDescription className="text-gray-500 font-medium mt-1">
                            New applications are now created by your assigned agent.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[24px] flex gap-4">
                            <div className="bg-amber-100 p-3 rounded-xl h-fit">
                                <ShieldCheck className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-amber-900 uppercase text-sm tracking-tight">Assisted Onboarding</h4>
                                <p className="text-sm text-amber-800/80 font-medium">
                                    To make sure your file is set up correctly, your agent will start any new immigration
                                    application on your behalf. Please reach out to your assigned specialist so they can
                                    create it for you.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => router.push("/dashboard/client")}
                            className="w-full bg-[#1E3A8A] hover:bg-blue-900 h-14 rounded-2xl font-black text-white shadow-xl shadow-blue-100"
                        >
                            Back to My Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}