"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Plus, ListOrdered, Loader2, Trash2, AlertCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { createTemplateAction, deleteTemplateAction } from "./actions";
import type { TemplateSummary } from "@/lib/steps-server";

export default function TemplateList({ initialTemplates }: { initialTemplates: TemplateSummary[] }) {
    const [templates, setTemplates] = useState(initialTemplates);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        startTransition(async () => {
            const result = await createTemplateAction(name, description);
            if (result?.error) {
                setError(result.error);
            } else {
                window.location.href = `/admin/dashboard/steps/${result.templateId}`;
            }
        });
    }

    function handleDelete(templateId: string) {
        startTransition(async () => {
            const result = await deleteTemplateAction(templateId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                setTemplates((prev) => prev.filter((t) => t.id !== templateId));
                toast.success("Workflow removed");
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    onClick={() => { setError(""); setName(""); setDescription(""); setIsCreateOpen(true); }}
                    className="bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold rounded-xl gap-2"
                >
                    <Plus className="h-4 w-4" /> New Workflow
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((t) => (
                    <Card key={t.id} className="border-none shadow-lg rounded-2xl overflow-hidden group">
                        <CardContent className="p-5 flex items-start justify-between gap-3">
                            <Link href={`/admin/dashboard/steps/${t.id}`} className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <ListOrdered className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wide">{t.stepCount} step{t.stepCount === 1 ? "" : "s"}</span>
                                </div>
                                <p className="font-black text-gray-900 truncate">{t.name}</p>
                                {t.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t.description}</p>}
                            </Link>
                            <div className="flex items-center gap-1 shrink-0">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="p-2 text-gray-300 hover:text-red-600 transition-colors rounded-lg" title="Remove workflow">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-2xl">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remove "{t.name}"?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                If this workflow was already used for a real application, it'll be hidden from future use instead of deleted, so that application's history stays intact.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">
                                                Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Link href={`/admin/dashboard/steps/${t.id}`}>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#1E3A8A] transition-colors" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-[#1E3A8A]">New Workflow</DialogTitle>
                        <DialogDescription>Give it a name — you'll build its steps on the next screen.</DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                            <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PR - Canada" disabled={isPending} required />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description (optional)</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={isPending} className="min-h-[70px]" />
                        </div>
                        <Button type="submit" disabled={isPending} className="w-full bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold h-11 rounded-xl">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create & Build Steps"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}