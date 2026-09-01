"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Loader2, AlertCircle, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getClientsAndTemplates, createApplicationAction } from "./actions";
import { useTranslations } from "next-intl";

interface ClientOption {
    id: string;
    name: string;
    email: string;
}

interface TemplateOption {
    id: string;
    name: string;
    description: string | null;
    stepCount: number;
}

export default function CreateApplicationModal({ onCreated }: { onCreated: (application: any) => void }) {
    const t = useTranslations("agentCreateApplication");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [templates, setTemplates] = useState<TemplateOption[]>([]);
    const [clientId, setClientId] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [country, setCountry] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setError("");
        getClientsAndTemplates().then((res) => {
            setLoading(false);
            if ("error" in res) {
                setError(res.error!);
                return;
            }
            setClients(res.clients || []);
            setTemplates(res.templates || []);
            if (res.templates && res.templates.length > 0) setTemplateId(res.templates[0].id);
        });
    }, [open]);

    function resetForm() {
        setClientId("");
        setTemplateId("");
        setCountry("");
        setError("");
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        startTransition(async () => {
            const result = await createApplicationAction(clientId, templateId, country);
            if (result?.error) {
                setError(result.error);
            } else {
                toast.success(t("toastCreated"));
                onCreated(result.application);
                setOpen(false);
                resetForm();
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
                <Button className="bg-[#1E3A8A] hover:bg-blue-900 text-white font-black rounded-2xl px-6 h-11 uppercase tracking-widest text-xs shadow-lg shadow-blue-100 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> {t("newProcedure")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-[#1E3A8A]">{t("newProcedure")}</DialogTitle>
                    <DialogDescription>{t("dialogDescription")}</DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                        <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="py-10 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                    </div>
                ) : templates.length === 0 ? (
                    <div className="py-8 text-center space-y-3">
                        <p className="text-sm text-gray-500">{t("noWorkflowsYet")}</p>
                        <Link href="/admin/dashboard/steps" className="inline-block px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-bold text-sm">
                            {t("askAdmin")}
                        </Link>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-500">{t("noClientsYet")}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>{t("clientLabel")}</Label>
                            <select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                required
                                disabled={isPending}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                            >
                                <option value="">{t("selectClientPlaceholder")}</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>{t("workflowLabel")}</Label>
                            <select
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                                required
                                disabled={isPending}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                            >
                                {templates.map((tpl) => (
                                    <option key={tpl.id} value={tpl.id}>{tpl.name} ({t("stepCount", { count: tpl.stepCount })})</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                <ListOrdered className="h-3.5 w-3.5" />
                                {t("workflowsManagedByAdmin")}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label>{t("destinationCountry")}</Label>
                            <Input
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder={t("countryPlaceholder")}
                                required
                                disabled={isPending}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold h-11 rounded-xl"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("createProcedure")}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}