"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, MapPin, Phone, Calendar, Users, Globe, Loader2 } from "lucide-react";
import { completeProfileAction } from "./actions";

export default function CompleteProfilePage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const res = await completeProfileAction(formData);

        if (res.error) {
            setError(res.error);
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    }

    if (isPending) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!session) {
        router.push("/sign-in");
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <Card className="w-full max-w-2xl shadow-xl border-gray-100 overflow-hidden">
                <div className="h-2 w-full bg-[#1E3A8A]" />
                <CardHeader className="pt-8 pb-4 text-center">
                    <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <User className="h-8 w-8 text-[#1E3A8A]" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Complete Your Profile</CardTitle>
                    <CardDescription className="text-gray-500 mt-2">
                        We need a few more details before you can start your immigration journey.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date of Birth */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" /> Date of Birth
                                </label>
                                <Input
                                    name="dateOfBirth"
                                    type="date"
                                    className="h-11 border-gray-200 focus:ring-[#1E3A8A]"
                                    required
                                />
                            </div>

                            {/* Nationality */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-blue-500" /> Nationality
                                </label>
                                <Input
                                    name="nationality"
                                    placeholder="Your country of citizenship"
                                    className="h-11 border-gray-200 focus:ring-[#1E3A8A]"
                                    required
                                />
                            </div>

                            {/* Marital Status */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" /> Marital Status
                                </label>
                                <select
                                    name="maritalStatus"
                                    className="w-full h-11 border border-gray-200 rounded-md bg-white px-3 text-sm focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="SINGLE">Single</option>
                                    <option value="MARRIED">Married</option>
                                    <option value="DIVORCED">Divorced</option>
                                    <option value="WIDOWED">Widowed</option>
                                </select>
                            </div>

                            {/* Number of Children */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" /> Number of Children
                                </label>
                                <Input
                                    name="numberOfChildren"
                                    type="number"
                                    min="0"
                                    defaultValue="0"
                                    className="h-11 border-gray-200 focus:ring-[#1E3A8A]"
                                    required
                                />
                            </div>
                        </div>

                       

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-500" /> Detailed Address
                            </label>
                            <textarea
                                name="address"
                                className="w-full min-h-[100px] border border-gray-200 rounded-md bg-white p-3 text-sm focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                                placeholder="Street, City, Province, Country"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#1E3A8A] hover:bg-blue-900 h-12 text-base font-bold transition-all shadow-md mt-4"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Complete Profile & Start Application"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
