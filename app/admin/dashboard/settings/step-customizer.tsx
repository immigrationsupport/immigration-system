"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowDown, Loader2, RotateCcw, Save, GripVertical, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { saveStepTemplatesAction, resetStepTemplatesAction, StepTemplateRow } from "./actions";

export default function StepCustomizer({ initialRows }: { initialRows: StepTemplateRow[] }) {
    const [rows, setRows] = useState<StepTemplateRow[]>(initialRows);
    const [error, setError] = useState("");
    const [isSaving, startSaving] = useTransition();
    const [isResetting, startResetting] = useTransition();

    function move(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= rows.length) return;
        const next = [...rows];
        [next[index], next[target]] = [next[target], next[index]];
        setRows(next);
    }

    function updateRow(index: number, patch: Partial<StepTemplateRow>) {
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    }

    function handleSave() {
        setError("");
        startSaving(async () => {
            const result = await saveStepTemplatesAction(rows.map((r, i) => ({ ...r, order: i })));
            if (result?.error) {
                setError(result.error);
            } else {
                toast.success("Application steps updated");
            }
        });
    }

    function handleReset() {
        startResetting(async () => {
            const result = await resetStepTemplatesAction();
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Reset to the default workflow");
                window.location.reload();
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
                {rows.map((row, index) => (
                    <div
                        key={row.type}
                        className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-3 ${row.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}
                    >
                        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                            <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => move(index, -1)}
                                className="p-1 text-gray-400 hover:text-[#1E3A8A] disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Move up"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </button>
                            <GripVertical className="h-4 w-4 text-gray-300" />
                            <button
                                type="button"
                                disabled={index === rows.length - 1}
                                onClick={() => move(index, 1)}
                                className="p-1 text-gray-400 hover:text-[#1E3A8A] disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Move down"
                            >
                                <ArrowDown className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-xs font-black text-gray-300 w-6 shrink-0">{index + 1}.</span>
                                    <Input
                                        value={row.label}
                                        onChange={(e) => updateRow(index, { label: e.target.value })}
                                        className="font-bold"
                                        placeholder="Step name"
                                    />
                                </div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 shrink-0 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={row.isActive}
                                        onChange={(e) => updateRow(index, { isActive: e.target.checked })}
                                    />
                                    Active
                                </label>
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-300 ml-8">{row.type.replace(/_/g, " ")}</p>
                            <Textarea
                                value={row.description || ""}
                                onChange={(e) => updateRow(index, { description: e.target.value })}
                                placeholder="Instructions shown to agents/clients for this step (optional)"
                                className="ml-8 w-[calc(100%-2rem)] text-sm min-h-[60px]"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#1E3A8A] text-white hover:bg-blue-900 font-bold rounded-xl gap-2"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isResetting}
                    className="font-bold rounded-xl gap-2"
                >
                    {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    Reset to Default
                </Button>
            </div>

            <p className="text-xs text-gray-400 pt-2">
                Changes only apply to new applications created from now on — steps already in progress keep the order and names they were created with.
            </p>
        </div>
    );
}