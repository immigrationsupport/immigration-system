"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, Plus, Trash, Loader2, ArrowRight, ArrowLeft, Briefcase, GraduationCap, Users } from "lucide-react";
import { createFullApplicationAction } from "./actions";

export default function NewApplicationPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    const [step, setStep] = useState(1);
    const [country, setCountry] = useState("");
    const [procedures, setProcedures] = useState<{ type: string; description: string }[]>([
        { type: "PR", description: "" }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addProcedure = () => {
        setProcedures([...procedures, { type: "PR", description: "" }]);
    };

    const removeProcedure = (index: number) => {
        if (procedures.length > 1) {
            setProcedures(procedures.filter((_, i) => i !== index));
        }
    };

    const updateProcedure = (index: number, field: string, value: string) => {
        const newProcedures = [...procedures];
        newProcedures[index] = { ...newProcedures[index], [field]: value };
        setProcedures(newProcedures);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        const res = await createFullApplicationAction({
            country,
            procedures
        });

        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            router.push("/dashboard/client");
            // Or to a page where they can upload docs specifically
        }
    };

    if (isPending) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Stepper */}
                <div className="flex items-center justify-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${step >= 1 ? "bg-[#1E3A8A] text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
                        <div className={`w-20 h-1 rounded-full transition-all ${step >= 2 ? "bg-[#1E3A8A]" : "bg-gray-200"}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${step >= 2 ? "bg-[#1E3A8A] text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
                        <div className={`w-20 h-1 rounded-full transition-all ${step >= 3 ? "bg-[#1E3A8A]" : "bg-gray-200"}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${step >= 3 ? "bg-[#1E3A8A] text-white" : "bg-gray-200 text-gray-500"}`}>3</div>
                    </div>
                </div>

                <Card className="shadow-xl border-gray-100 overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between p-6">
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">Start New Application</CardTitle>
                            <CardDescription className="text-gray-500 mt-1">One application per country. Multiple procedures allowed.</CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-medium animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-blue-500" /> Destination Country
                                    </label>
                                    <Input
                                        placeholder="e.g. Canada, France, USA"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="h-14 text-lg border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-[#1E3A8A] outline-none transition-all shadow-sm"
                                    />
                                    <p className="text-xs text-gray-500 italic mt-2">All immigration pathways for this country will be grouped here.</p>
                                </div>
                                <div className="pt-6 flex justify-end">
                                    <Button
                                        onClick={() => country.trim() ? setStep(2) : setError("Please enter a country.")}
                                        className="bg-[#1E3A8A] hover:bg-blue-900 px-8 py-6 rounded-lg font-bold text-lg shadow-md transition-all hover:translate-x-1"
                                    >
                                        Next <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-800 tracking-tight">Immigration Pathways (Procedures)</h3>
                                        <Button
                                            variant="outline"
                                            onClick={addProcedure}
                                            className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg h-10 font-bold"
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Add Pathway
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {procedures.map((p, index) => (
                                            <div key={index} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 relative shadow-sm hover:shadow-md transition-all group">
                                                {procedures.length > 1 && (
                                                    <button
                                                        onClick={() => removeProcedure(index)}
                                                        className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-red-50 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</label>
                                                        <select
                                                            className="w-full h-11 border border-gray-200 rounded-xl bg-white px-3 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                                            value={p.type}
                                                            onChange={(e) => updateProcedure(index, "type", e.target.value)}
                                                        >
                                                            <option value="PR">Permanent Residency</option>
                                                            <option value="WORK">Work Visa</option>
                                                            <option value="STUDY">Study Visa</option>
                                                            <option value="SCHOLARSHIP">Scholarship</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description / Goal</label>
                                                        <Input
                                                            placeholder="e.g. Seeking study visa for Fall 2024 intake"
                                                            value={p.description}
                                                            onChange={(e) => updateProcedure(index, "description", e.target.value)}
                                                            className="h-11 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-between">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep(1)}
                                        className="text-gray-500 hover:text-gray-900 font-bold"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button
                                        onClick={() => setStep(3)}
                                        className="bg-[#1E3A8A] hover:bg-blue-900 px-8 py-6 rounded-lg font-bold text-lg shadow-md transition-all hover:translate-x-1"
                                    >
                                        Review <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in zoom-in duration-500">
                                <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 space-y-6">
                                    <div className="flex items-center gap-4 pb-4 border-b border-blue-100">
                                        <div className="bg-[#1E3A8A] p-2 rounded-xl text-white shadow-lg">
                                            <Globe className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Country</p>
                                            <h3 className="text-2xl font-black text-blue-900">{country}</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selected Pathways</p>
                                        {procedures.map((p, idx) => (
                                            <div key={idx} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-blue-50 shadow-sm">
                                                <div className="bg-blue-100 p-2 rounded-lg text-[#1E3A8A]">
                                                    {p.type === "WORK" ? <Briefcase className="h-5 w-5" /> :
                                                        p.type === "STUDY" ? <GraduationCap className="h-5 w-5" /> :
                                                            <Users className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{p.type === "PR" ? "Permanent Residency" : p.type === "WORK" ? "Work Visa" : p.type === "STUDY" ? "Study Visa" : "Scholarship"}</p>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{p.description || "No description provided"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-between gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep(2)}
                                        className="flex-1 text-gray-500 h-14 font-bold text-lg"
                                    >
                                        Edit Details
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 h-14 rounded-xl font-bold text-lg shadow-xl shadow-blue-100 transition-all hover:scale-[1.02]"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Confirm and Create Application"}
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
