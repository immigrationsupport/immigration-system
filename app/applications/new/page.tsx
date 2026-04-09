"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, Loader2, ArrowRight, ArrowLeft, Briefcase, GraduationCap, Users, ShieldCheck } from "lucide-react";
import { createFullApplicationAction } from "./actions";

export default function NewApplicationPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    const [step, setStep] = useState(2);
    const [country, setCountry] = useState("Canada");
    const [type, setType] = useState("PR");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        const res = await createFullApplicationAction({
            country,
            type,
            description
        });

        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            router.push("/dashboard/client");
        }
    };

    if (isPending) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Stepper */}
                <div className="flex items-center justify-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${step >= 2 ? "bg-[#1E3A8A] text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
                        <div className={`w-20 h-1 rounded-full transition-all ${step >= 3 ? "bg-[#1E3A8A]" : "bg-gray-200"}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${step >= 3 ? "bg-[#1E3A8A] text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
                    </div>
                </div>

                <Card className="shadow-xl border-gray-100 overflow-hidden rounded-[32px]">
                    <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between p-8">
                        <div>
                            <CardTitle className="text-2xl font-black text-[#1E3A8A] uppercase tracking-tight">Start New Journey</CardTitle>
                            <CardDescription className="text-gray-500 font-medium mt-1">Begin your immigration process with our structured roadmap.</CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}



                        {step === 2 && (
                            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Application Type</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full h-16 border border-gray-100 rounded-2xl bg-gray-50/50 px-5 text-lg font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                            >
                                                <option value="PR">Permanent Residency</option>
                                                <option value="WORK">Work Visa</option>
                                                <option value="STUDY">Study Visa</option>
                                                <option value="SCHOLARSHIP">Scholarship</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <ArrowRight className="h-5 w-5 rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Brief Goal (Optional)</label>
                                        <Input
                                            placeholder="e.g. Master's in CS"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="h-16 border-gray-100 rounded-2xl bg-gray-50/50 focus:ring-4 focus:ring-blue-100 transition-all font-bold placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 p-6 rounded-[24px] flex gap-4">
                                    <div className="bg-amber-100 p-3 rounded-xl h-fit">
                                        <ShieldCheck className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-amber-900 uppercase text-sm tracking-tight">Structured Process</h4>
                                        <p className="text-sm text-amber-800/80 font-medium">Your application will follow a mandatory 11-step roadmap including fee payment, document collection, and medical exams.</p>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end items-center">
                                    <Button
                                        onClick={() => setStep(3)}
                                        className="bg-[#1E3A8A] hover:bg-blue-900 px-10 py-7 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all hover:translate-x-1 active:scale-95"
                                    >
                                        Final Review <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10 animate-in zoom-in duration-500">
                                <div className="bg-[#1E3A8A] text-white rounded-[32px] p-10 relative overflow-hidden shadow-2xl shadow-blue-200">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center gap-6">
                                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                                                <Globe className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">Destination</p>
                                                <h3 className="text-3xl font-black">{country}</h3>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                                            <div>
                                                <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-2">Pathway</p>
                                                <div className="flex items-center gap-3">
                                                    {type === "WORK" ? <Briefcase className="h-5 w-5" /> :
                                                     type === "STUDY" ? <GraduationCap className="h-5 w-5" /> :
                                                     <Users className="h-5 w-5" />}
                                                    <span className="font-bold text-lg">{type.replace("_", " ")}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-2">Goal</p>
                                                <p className="font-bold text-lg">{description || "General Immigration"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex flex-col md:flex-row gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep(2)}
                                        className="flex-1 text-gray-400 h-16 font-bold text-lg rounded-2xl"
                                    >
                                        Make Changes
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 h-16 rounded-2xl font-black text-xl shadow-2xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Start Application"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
