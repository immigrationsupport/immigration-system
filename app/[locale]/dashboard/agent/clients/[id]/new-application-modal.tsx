"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Globe, ListOrdered } from "lucide-react";
import { createApplicationForClientAction, getWorkflowTemplatesAction } from "./actions";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface TemplateOption {
    id: string;
    name: string;
    description: string | null;
    stepCount: number;
}

export default function NewApplicationModal({ clientId, clientName }: { clientId: string; clientName: string }) {
    const t = useTranslations("agentNewApplication");
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [templates, setTemplates] = useState<TemplateOption[]>([]);
    const [country, setCountry] = useState("Canada");
    const [templateId, setTemplateId] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (!open) return;
        setLoadingTemplates(true);
        getWorkflowTemplatesAction().then((res) => {
            setLoadingTemplates(false);
            if ("error" in res) return;
            setTemplates(res.templates || []);
            if (res.templates && res.templates.length > 0) setTemplateId(res.templates[0].id);
        });
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createApplicationForClientAction(clientId, { country, type: "PR", templateId, description });

        setLoading(false);
        if (result.success) {
            toast.success(t("toastCreated"));
            setOpen(false);
            setCountry("Canada");
            setDescription("");
            router.refresh();
        } else {
            toast.error(result.error || t("toastError"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#1E3A8A] hover:bg-[#152a6a] text-white font-black rounded-2xl px-6 h-12 uppercase tracking-widest text-xs shadow-lg shadow-blue-200 flex items-center gap-2">
                    <Plus size={16} /> {t("newProcedure")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-2xl">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                        <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-900">{t("dialogTitle")}</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                        {t.rich("dialogDescription", { clientName, b: (chunks) => <span className="text-blue-600 font-bold">{chunks}</span> })}
                    </DialogDescription>
                </DialogHeader>

                {loadingTemplates ? (
                    <div className="py-10 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                    </div>
                ) : templates.length === 0 ? (
                    <div className="py-8 text-center space-y-3">
                        <p className="text-sm text-gray-500">{t("noWorkflowsYet")}</p>
                        <Link href="/admin/dashboard/steps" className="inline-block px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-bold text-sm">
                            {t("setUpWorkflow")}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("destinationCountry")}</label>
                            <Input
                                placeholder={t("countryPlaceholder")}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("workflowLabel")}</label>
                            <select
                                className="w-full h-12 border border-gray-100 rounded-xl bg-gray-50/50 px-4 font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                                required
                            >
                                {templates.map((tpl) => (
                                    <option key={tpl.id} value={tpl.id}>{tpl.name} ({t("stepCount", { count: tpl.stepCount })})</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 ml-1">
                                <ListOrdered className="h-3 w-3" /> {t("manageUnderSteps")}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("notesLabel")}</label>
                            <Input
                                placeholder={t("notesPlaceholder")}
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-100 font-bold"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="font-bold text-gray-500 hover:bg-gray-50 rounded-xl"
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-[#1E3A8A] hover:bg-[#152a6a] text-white font-black rounded-xl px-8 shadow-lg shadow-blue-200"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("createProcedure")}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}