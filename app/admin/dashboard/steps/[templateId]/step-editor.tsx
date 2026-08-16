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
    ChevronDown,
    ChevronRight,
    AlertCircle,
    ListTree
} from "lucide-react";
import { toast } from "sonner";
import { saveTemplateStepsAction } from "../actions";
import type { StepDefinition } from "@/lib/steps";
import type { ProcedureType } from "@prisma/client";

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
    expanded: boolean;
    subSteps: SubStepRow[];
}

function makeKey() {
    return Math.random().toString(36).slice(2);
}

function toStepRows(steps: StepDefinition[]): StepRow[] {
    return steps.map((s) => ({
        key: makeKey(),
        type: s.type || "",
        label: s.label,
        description: s.description || "",
        isActive: true,
        expanded: false,
        subSteps: s.subSteps.map((sub) => ({
            key: makeKey(),
            label: sub.label,
            description: sub.description || ""
        }))
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
    const [steps, setSteps] = useState<StepRow[]>(toStepRows(initialSteps));
    const [error, setError] = useState("");
    const [isSaving, startSaving] = useTransition();

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
            { key: makeKey(), type: "", label: "", description: "", isActive: true, expanded: true, subSteps: [] }
        ]);
    }

    function removeStep(index: number) {
        setSteps((prev) => prev.filter((_, i) => i !== index));
    }

    function addSubStep(stepIndex: number) {
        setSteps((prev) =>
            prev.map((s, i) =>
                i === stepIndex ? { ...s, subSteps: [...s.subSteps, { key: makeKey(), label: "", description: "" }] } : s
            )
        );
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

    function removeSubStep(stepIndex: number, subIndex: number) {
        setSteps((prev) =>
            prev.map((s, i) => (i === stepIndex ? { ...s, subSteps: s.subSteps.filter((_, j) => j !== subIndex) } : s))
        );
    }

    function handleSave() {
        setError("");
        startSaving(async () => {
            const result = await saveTemplateStepsAction(
                templateId,
                steps.map((s) => ({
                    type: s.type || null,
                    label: s.label,
                    description: s.description,
                    isActive: s.isActive,
                    subSteps: s.subSteps.map((sub) => ({ label: sub.label, description: sub.description }))
                }))
            );
            if (result?.error) {
                setError(result.error);
            } else {
                toast.success("Workflow saved");
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
                            <button type="button" disabled={index === 0} onClick={() => moveStep(index, -1)} className="p-1 text-gray-400 hover:text-[#1E3A8A] disabled:opacity-20" title="Move up">
                                <ArrowUp className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-black text-gray-300">{index + 1}</span>
                            <button type="button" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)} className="p-1 text-gray-400 hover:text-[#1E3A8A] disabled:opacity-20" title="Move down">
                                <ArrowDown className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateStep(index, { expanded: !step.expanded })}
                                    className="p-1 text-gray-400 hover:text-[#1E3A8A] shrink-0"
                                    title="Sub-steps"
                                >
                                    {step.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                                <Input
                                    value={step.label}
                                    onChange={(e) => updateStep(index, { label: e.target.value })}
                                    placeholder="Step name"
                                    className="font-bold flex-1"
                                />
                                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 shrink-0 whitespace-nowrap">
                                    <input type="checkbox" checked={step.isActive} onChange={(e) => updateStep(index, { isActive: e.target.checked })} />
                                    Active
                                </label>
                                <button type="button" onClick={() => removeStep(index)} className="p-1.5 text-gray-300 hover:text-red-600 shrink-0" title="Delete step">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="ml-8 flex items-center gap-2">
                                <select
                                    value={step.type}
                                    onChange={(e) => updateStep(index, { type: e.target.value as ProcedureType | "" })}
                                    className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600"
                                >
                                    <option value="">Custom step (no special behavior)</option>
                                    {builtInTypes.map((t) => (
                                        <option key={t.type} value={t.type}>Behaves like: {t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <Textarea
                                value={step.description}
                                onChange={(e) => updateStep(index, { description: e.target.value })}
                                placeholder="Instructions shown to agents/clients for this step (optional)"
                                className="ml-8 w-[calc(100%-2rem)] text-sm min-h-[50px]"
                            />

                            {step.expanded && (
                                <div className="ml-8 pl-4 border-l-2 border-gray-100 space-y-2 pt-1">
                                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-300 flex items-center gap-1.5">
                                        <ListTree className="h-3.5 w-3.5" /> Sub-steps
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
                                                placeholder="Sub-step name"
                                                className="text-sm flex-1"
                                            />
                                            <button type="button" onClick={() => removeSubStep(index, subIndex)} className="p-1 text-gray-300 hover:text-red-600 shrink-0">
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
                                        <Plus className="h-3.5 w-3.5" /> Add sub-step
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" onClick={addStep} className="font-bold rounded-xl gap-2">
                    <Plus className="h-4 w-4" /> Add Step
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold rounded-xl gap-2 ml-auto">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Workflow
                </Button>
            </div>

            <p className="text-xs text-gray-400 pt-2">
                Changes only apply to new applications created with this workflow from now on — applications already in progress keep the steps they were created with.
            </p>
        </div>
    );
}