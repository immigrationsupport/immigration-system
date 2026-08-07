"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Building2, Plus, Users, FileText, Ban, CheckCircle2, AlertCircle, Loader2, CreditCard } from "lucide-react";
import { createAgencyAction, toggleSuspendAgencyAction, setAgencyPlanAction } from "./actions";

interface Plan {
    id: string;
    name: string;
    slug: string;
    priceFcfa: number;
    maxAgents: number | null;
    maxClients: number | null;
    isPublic: boolean;
}

interface Agency {
    id: string;
    name: string;
    status: "ACTIVE" | "SUSPENDED";
    isInternal: boolean;
    createdAt: string;
    _count: { users: number; applications: number };
    subscription: { plan: Plan } | null;
}

export default function AgencyList({ initialAgencies, plans }: { initialAgencies: Agency[]; plans: Plan[] }) {
    const [agencies, setAgencies] = useState(initialAgencies);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    function handleChangePlan(agencyId: string, planId: string) {
        startTransition(async () => {
            const result = await setAgencyPlanAction(agencyId, planId);
            if (!result?.error) {
                const plan = plans.find(p => p.id === planId);
                setAgencies(prev => prev.map(a => a.id === agencyId ? { ...a, subscription: plan ? { plan } : a.subscription } : a));
            }
        });
    }

    function handleCreate(formData: FormData) {
        setError("");
        startTransition(async () => {
            const result = await createAgencyAction(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setIsCreateOpen(false);
                formRef.current?.reset();
                window.location.reload();
            }
        });
    }

    function handleToggleSuspend(agencyId: string, currentlySuspended: boolean) {
        startTransition(async () => {
            const result = await toggleSuspendAgencyAction(agencyId, currentlySuspended);
            if (!result?.error) {
                setAgencies(prev => prev.map(a =>
                    a.id === agencyId ? { ...a, status: currentlySuspended ? "ACTIVE" : "SUSPENDED" } : a
                ));
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold rounded-xl gap-2"
                >
                    <Plus className="h-4 w-4" /> New Agency
                </Button>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-100/80">
                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">Agency</th>
                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">Users</th>
                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">Applications</th>
                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">Plan</th>
                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200">Status</th>
                                <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] border-b-2 border-gray-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {agencies.map(agency => (
                                <tr key={agency.id} className="hover:bg-blue-50/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-[#1E3A8A]">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{agency.name}</div>
                                                {agency.isInternal && (
                                                    <span className="text-xs text-gray-400 font-semibold">Internal (migration)</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-semibold">
                                        <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-gray-400" /> {agency._count.users}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-semibold">
                                        <div className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-gray-400" /> {agency._count.applications}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {agency.isInternal ? (
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Internal</span>
                                        ) : (
                                            <select
                                                disabled={isPending}
                                                value={agency.subscription?.plan.id || ""}
                                                onChange={(e) => handleChangePlan(agency.id, e.target.value)}
                                                className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] bg-white"
                                            >
                                                <option value="" disabled>Select plan</option>
                                                {plans.filter(p => p.slug !== "internal").map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.priceFcfa.toLocaleString()} FCFA)</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                                            agency.status === "ACTIVE"
                                                ? "bg-green-100 text-green-700 border border-green-200"
                                                : "bg-red-100 text-red-700 border border-red-200"
                                        }`}>
                                            {agency.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!agency.isInternal && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={isPending}
                                                onClick={() => handleToggleSuspend(agency.id, agency.status === "SUSPENDED")}
                                                className="gap-1.5 font-bold"
                                            >
                                                {agency.status === "SUSPENDED" ? (
                                                    <><CheckCircle2 className="h-4 w-4" /> Reactivate</>
                                                ) : (
                                                    <><Ban className="h-4 w-4" /> Suspend</>
                                                )}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {agencies.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-semibold">
                                        No agencies yet. Create the first one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-[#1E3A8A]">New Agency</DialogTitle>
                        <DialogDescription>
                            Creates the agency and its first Admin account in one step.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
                            <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form ref={formRef} action={handleCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-800">Agency name</label>
                            <Input name="agencyName" required disabled={isPending} />
                        </div>
                        <hr className="border-gray-200" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">First Admin account</p>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-800">Full name</label>
                            <Input name="adminName" required disabled={isPending} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-800">Email</label>
                            <Input name="adminEmail" type="email" required disabled={isPending} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-800">Temporary password</label>
                            <Input name="adminPassword" type="password" required disabled={isPending} />
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold h-11 rounded-xl"
                        >
                            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Agency"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}