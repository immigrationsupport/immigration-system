"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowUp,
    ArrowDown,
    Loader2,
    Save,
    Plus,
    Trash2,
    AlertCircle,
    ListTree,
    FileCheck2,
    X
} from "lucide-react";
import { toast } from "sonner";
import { saveTemplateStepsAction } from "../actions";
import type { StepDefinition } from "@/lib/steps";
import type { ProcedureType } from "@prisma/client";
import { useTranslations } from "next-intl";

interface SubStepRow {
    key: string;
    label: string;
    description: string;
}

interface StepRow {
    key: string;
    type: ProcedureType | "";
    label: string;
    description: string;
    isActive: boolean;
    subSteps: SubStepRow[];
    requiredDocuments: string[];
}

function makeKey() {
    return Math.random().toString(36).slice(2);
}

function toStepRows(steps: StepDefinition[]): StepRow[] {
    return steps.map((s) => ({
        key: makeKey(),
        type: s.type || "",
        label: s.label || "",
        description: s.description || "",
        isActive: true,
        subSteps: s.subSteps.map((sub) => ({
            key: makeKey(),
            label: sub.label,
            description: sub.description || ""
        })),
        requiredDocuments: s.requiredDocuments || []
    }));
}

export default function StepEditor({
    templateId,
    initialSteps,
    builtInTypes
}: {
    templateId: string;
    initialSteps: StepDefinition[];
    builtInTypes: { type: ProcedureType; label: string }[];
}) {
    const t = useTranslations("adminSteps.editor");
    const [steps, setSteps] = useState<StepRow[]>(toStepRows(initialSteps));
    const [error, setError] = useState("");
    const [isSaving, startSaving] = useTransition();
    const [deleteStepIndex, setDeleteStepIndex] = useState<number | null>(null);
    const [deleteSubStep, setDeleteSubStep] = useState<{ stepIndex: number; subIndex: number } | null>(null);
    const [deleteDocument, setDeleteDocument] = useState<{ stepIndex: number; docIndex: number } | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    function updateStep(index: number, patch: Partial<StepRow>) {
        setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    }

    function moveStep(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= steps.length) return;
        const next = [...steps];
        [next[index], next[target]] = [next[target], next[index]];
        setSteps(next);
    }

    function addStep() {
        setSteps((prev) => [
            ...prev,
            { key: makeKey(), type: "", label: "", description: "", isActive: true, subSteps: [], requiredDocuments: [] }
        ]);
    }

    function requestRemoveStep(index: number) {
        setDeleteConfirmText("");
        setDeleteStepIndex(index);
    }

    function confirmRemoveStep() {
        if (deleteStepIndex === null || deleteConfirmText !== "DELETE") return;
        setSteps((prev) => prev.filter((_, i) => i !== deleteStepIndex));
        setDeleteStepIndex(null);
        setDeleteConfirmText("");
    }

    function addRequiredDocument(stepIndex: number, name: string) {
        const trimmed = name.trim();
        if (!trimmed) return;
        setSteps((prev) =>
            prev.map((s, i) =>
                i === stepIndex && !s.requiredDocuments.includes(trimmed)
                    ? { ...s, requiredDocuments: [...s.requiredDocuments, trimmed] }
                    : s
            )
        );
    }

    function requestRemoveRequiredDocument(stepIndex: number, docIndex: number) {
        setDeleteDocument({ stepIndex, docIndex });
    }

    function confirmRemoveRequiredDocument() {
        if (!deleteDocument) return;
        const { stepIndex, docIndex } = deleteDocument;
        setSteps((prev) => prev.map((s, i) =>
            i === stepIndex ? { ...s, requiredDocuments: s.requiredDocuments.filter((_, j) => j !== docIndex) } : s
        ));
        setDeleteDocument(null);
    }

    function addSubStep(stepIndex: number) {
        setSteps((prev) =>
            prev.map((s, i) =>
                i === stepIndex ? { ...s, subSteps: [...s.subSteps, { key: makeKey(), label: "", description: "" }] } : s
            )
        );
    }

    function commitSubStepOnEnter(stepIndex: number, subIndex: number) {
        const current = steps[stepIndex]?.subSteps[subIndex];
        if (!current?.label.trim()) return;
        addSubStep(stepIndex);
    }

    function commitDocumentOnEnter(stepIndex: number, value: string, input: HTMLInputElement) {
        const trimmed = value.trim();
        if (!trimmed) return;
        addRequiredDocument(stepIndex, trimmed);
        input.value = "";
    }

    function updateSubStep(stepIndex: number, subIndex: number, patch: Partial<SubStepRow>) {
        setSteps((prev) =>
            prev.map((s, i) =>
                i === stepIndex
                    ? { ...s, subSteps: s.subSteps.map((sub, j) => (j === subIndex ? { ...sub, ...patch } : sub)) }
                    : s
            )
        );
    }

    function moveSubStep(stepIndex: number, subIndex: number, direction: -1 | 1) {
        setSteps((prev) =>
            prev.map((s, i) => {
                if (i !== stepIndex) return s;
                const target = subIndex + direction;
                if (target < 0 || target >= s.subSteps.length) return s;
                const next = [...s.subSteps];
                [next[subIndex], next[target]] = [next[target], next[subIndex]];
                return { ...s, subSteps: next };
            })
        );
    }

    function requestRemoveSubStep(stepIndex: number, subIndex: number) {
        setDeleteSubStep({ stepIndex, subIndex });
    }

    function confirmRemoveSubStep() {
        if (!deleteSubStep) return;
        const { stepIndex, subIndex } = deleteSubStep;
        setSteps((prev) => prev.map((s, i) =>
            i === stepIndex ? { ...s, subSteps: s.subSteps.filter((_, j) => j !== subIndex) } : s
        ));
        setDeleteSubStep(null);
    }

    function handleSave() {
        setError("");
        startSaving(async () => {
            const result = await saveTemplateStepsAction(
                templateId,
                steps.map((s) => ({
                    type: s.type || null,
                    label: s.label || "",
                    description: s.description,
                    isActive: s.isActive,
                    subSteps: s.subSteps.map((sub) => ({ label: sub.label, description: sub.description })),
                    requiredDocuments: s.requiredDocuments
                }))
            );
            if (result?.error) {
                setError(result.error);
            } else {
                toast.success(t("toastSaved"));
            }
        });
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                    <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-3">
                {steps.map((step, index) => (
                    <div
                        key={step.key}
                        className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-3 ${step.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}
                    >
                        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                            <button type="button" disabled={index === 0} onClick={() => moveStep(index, -1)} className="p-1 text-gray-400 hover:text-[#1E3A8A] disabled:opacity-20" title={t("moveUp")}>
                                <ArrowUp className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-black text-gray-300">{index + 1}</span>
                            <button type="button" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)} className="p-1 text-gray-400 hover:text-[#1E3A8A] disabled:opacity-20" title={t("moveDown")}>
                                <ArrowDown className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={step.label}
                                    onChange={(e) => updateStep(index, { label: e.target.value })}
                                    placeholder={t("stepNamePlaceholder")}
                                    className="font-bold flex-1"
                                />
                                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 shrink-0 whitespace-nowrap">
                                    <input type="checkbox" checked={step.isActive} onChange={(e) => updateStep(index, { isActive: e.target.checked })} />
                                    {t("active")}
                                </label>
                                <button type="button" onClick={() => requestRemoveStep(index)} className="p-1.5 text-gray-300 hover:text-red-600 shrink-0" title={t("deleteStepTooltip")}>
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={step.type}
                                    onChange={(e) => updateStep(index, { type: e.target.value as ProcedureType | "" })}
                                    className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600"
                                >
                                    <option value="">{t("customStepOption")}</option>
                                    {builtInTypes.map((bt) => (
                                        <option key={bt.type} value={bt.type}>{t("behavesLike", { label: bt.label })}</option>
                                    ))}
                                </select>
                            </div>

                            <Textarea
                                value={step.description}
                                onChange={(e) => updateStep(index, { description: e.target.value })}
                                placeholder={t("instructionsPlaceholder")}
                                className="w-full text-sm min-h-[50px]"
                            />

                            <div className="w-full pt-1">
                                <p className="text-[11px] font-black uppercase tracking-wide text-gray-300 flex items-center gap-1.5 mb-1.5">
                                    <FileCheck2 className="h-3.5 w-3.5" /> {t("requiredDocumentsLabel")}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {step.requiredDocuments.map((doc, docIndex) => (
                                        <span key={docIndex} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                            {doc}
                                            <button type="button" onClick={() => requestRemoveRequiredDocument(index, docIndex)} className="text-blue-300 hover:text-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={t("addDocumentPlaceholder")}
                                        className="text-sm h-9 flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                commitDocumentOnEnter(index, e.currentTarget.value, e.currentTarget);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3 gap-1.5 font-bold shrink-0"
                                        onClick={(e) => {
                                            const input = e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement | null;
                                            if (input) commitDocumentOnEnter(index, input.value, input);
                                        }}
                                    >
                                        <Plus className="h-3.5 w-3.5" /> {t("addDocument")}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    {t("requiredDocumentsHint")}
                                </p>
                            </div>

                            <div className="pl-4 border-l-2 border-gray-100 space-y-2 pt-1">
                                <p className="text-[11px] font-black uppercase tracking-wide text-gray-300 flex items-center gap-1.5">
                                    <ListTree className="h-3.5 w-3.5" /> {t("subStepsLabel")}
                                </p>
                                {step.subSteps.map((sub, subIndex) => (
                                    <div key={sub.key} className="flex items-center gap-2">
                                        <div className="flex flex-col shrink-0">
                                            <button type="button" disabled={subIndex === 0} onClick={() => moveSubStep(index, subIndex, -1)} className="text-gray-300 hover:text-[#1E3A8A] disabled:opacity-20">
                                                <ArrowUp className="h-3 w-3" />
                                            </button>
                                            <button type="button" disabled={subIndex === step.subSteps.length - 1} onClick={() => moveSubStep(index, subIndex, 1)} className="text-gray-300 hover:text-[#1E3A8A] disabled:opacity-20">
                                                <ArrowDown className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <Input
                                            value={sub.label}
                                            onChange={(e) => updateSubStep(index, subIndex, { label: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    commitSubStepOnEnter(index, subIndex);
                                                }
                                            }}
                                            placeholder={t("subStepPlaceholder")}
                                            className="text-sm flex-1"
                                        />
                                        <button type="button" onClick={() => requestRemoveSubStep(index, subIndex)} className="p-1 text-gray-300 hover:text-red-600 shrink-0">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSubStep(index)}
                                    className="gap-1.5 font-bold text-xs h-8 rounded-lg"
                                >
                                    <Plus className="h-3.5 w-3.5" /> {t("addSubStep")}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 pt-2 pb-24">
                <Button variant="outline" onClick={addStep} className="font-bold rounded-xl gap-2">
                    <Plus className="h-4 w-4" /> {t("addStep")}
                </Button>
            </div>

            <p className="text-xs text-gray-400 pt-2 pb-24">
                {t("footerNote")}
            </p>

            {/* Floating save bar */}
            <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md">
                    <div className="hidden min-w-0 sm:block">
                        <p className="text-sm font-black text-gray-900">{t("saveWorkflow")}</p>
                        <p className="text-xs text-gray-500">
                            {isSaving ? "..." : t("footerNote")}
                        </p>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="ml-auto w-full rounded-xl bg-[#1E3A8A] px-5 py-2.5 font-bold text-white shadow-md hover:bg-blue-900 sm:w-auto"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isSaving ? "..." : t("saveWorkflow")}
                    </Button>
                </div>
            </div>

            {deleteStepIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                        <h2 className="text-lg font-black text-gray-900">{t("deleteStepTitle")}</h2>
                        <p className="text-sm text-gray-500 mt-2">{t("deleteStepDescription")}</p>
                        <p className="text-sm font-bold text-gray-700 mt-4">{t("typeDeleteToConfirm")}</p>
                        <Input
                            autoFocus
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                            placeholder="DELETE"
                            className="mt-2 font-bold"
                        />
                        <div className="flex justify-end gap-2 mt-5">
                            <Button variant="outline" onClick={() => setDeleteStepIndex(null)} className="rounded-xl">{t("cancel")}</Button>
                            <Button disabled={deleteConfirmText !== "DELETE"} onClick={confirmRemoveStep} className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2">
                                <Trash2 className="h-4 w-4" /> {t("delete")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deleteSubStep && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                        <h2 className="text-lg font-black text-gray-900">{t("deleteSubStepTitle")}</h2>
                        <p className="text-sm text-gray-500 mt-2">{t("deleteSubStepDescription")}</p>
                        <div className="flex justify-end gap-2 mt-5">
                            <Button variant="outline" onClick={() => setDeleteSubStep(null)} className="rounded-xl">{t("cancel")}</Button>
                            <Button onClick={confirmRemoveSubStep} className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"><Trash2 className="h-4 w-4" /> {t("delete")}</Button>
                        </div>
                    </div>
                </div>
            )}

            {deleteDocument && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                        <h2 className="text-lg font-black text-gray-900">{t("deleteDocumentTitle")}</h2>
                        <p className="text-sm text-gray-500 mt-2">{t("deleteDocumentDescription")}</p>
                        <div className="flex justify-end gap-2 mt-5">
                            <Button variant="outline" onClick={() => setDeleteDocument(null)} className="rounded-xl">{t("cancel")}</Button>
                            <Button onClick={confirmRemoveRequiredDocument} className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"><Trash2 className="h-4 w-4" /> {t("delete")}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}